import os

import requests
from rest_framework import parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import AdminCookieAuthentication
from .models import LeadSubmission, PortfolioProject, ProjectImage
from .serializers import (
    LeadSubmissionSerializer,
    PortfolioProjectDetailSerializer,
    PortfolioProjectListSerializer,
    ProjectImageSerializer,
)
from .slug_utils import latin_slug_from_text


def parse_bool(v) -> bool:
    if isinstance(v, bool):
        return v
    s = str(v or "").strip().lower()
    return s in ("1", "true", "on", "yes")


def valid_email(v: str) -> bool:
    v = (v or "").strip()
    return "@" in v and "." in v.split("@")[-1]


def valid_phone(v: str) -> bool:
    digits = "".join([c for c in str(v or "") if c.isdigit()])
    return len(digits) >= 10


class ContactSubmitView(APIView):
    """
    POST /api/contact
    """

    parser_classes = [parsers.JSONParser, parsers.FormParser]

    def post(self, request):
        data = request.data or {}
        name = str(data.get("name") or "").strip()
        contact = str(data.get("contact") or "").strip()
        description = str(data.get("description") or "").strip()
        project_type = str(data.get("projectType") or data.get("project_type") or "").strip()

        if not name or len(name) < 2:
            return Response(
                {"error": "Имя обязательное поле (минимум 2 символа)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not contact:
            return Response(
                {"error": "Контакт обязателен: email / телефон / Telegram."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Сохраняем заявку (лучше для аналитики/проверки, чем только email)
        LeadSubmission.objects.create(
            name=name,
            contact=contact,
            description=description,
            project_type=project_type,
        )

        # Отправка уведомления через Resend (плейсхолдер/опционально)
        resend_api_key = os.environ.get("RESEND_API_KEY")
        to_email = os.environ.get("RESEND_TO_EMAIL")
        from_email = os.environ.get("RESEND_FROM_EMAIL")

        if resend_api_key and to_email and from_email:
            subject = f"Заявка на проект: {name}"
            text_lines = [
                f"Имя: {name}",
                f"Контакт: {contact}",
            ]
            if project_type:
                text_lines.append(f"Тип проекта: {project_type}")
            if description:
                text_lines.append(f"Описание: {description}")
            text = "\n".join(text_lines)

            html = f"""
              <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
                <h2 style="margin:0 0 12px;">Новая заявка на проект</h2>
                <div style="white-space:pre-wrap;line-height:1.5;">{text}</div>
              </div>
            """

            try:
                requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {resend_api_key}",
                    },
                    json={
                        "from": from_email,
                        "to": [to_email],
                        "subject": subject,
                        "text": text,
                        "html": html,
                    },
                    timeout=10,
                )
            except Exception:
                # Не роняем фронт из-за email — заявку уже сохранили.
                pass

        return Response({"ok": True}, status=status.HTTP_200_OK)


class PublicPortfolioView(APIView):
    """
    GET /api/portfolio (только published)
    """

    def get(self, request):
        qs = PortfolioProject.objects.filter(published=True).order_by("-updated_at")
        serializer = PortfolioProjectListSerializer(qs, many=True, context={"request": request})
        return Response({"projects": serializer.data}, status=status.HTTP_200_OK)


class PublicPortfolioDetailView(APIView):
    """
    GET /api/portfolio/<slug> (только published)
    """

    def get(self, request, slug):
        try:
            project = PortfolioProject.objects.get(slug=slug, published=True)
        except PortfolioProject.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PortfolioProjectDetailSerializer(project, context={"request": request})
        return Response({"project": serializer.data}, status=status.HTTP_200_OK)


class AdminAuthView(APIView):
    """
    POST /api/admin/auth
    Устанавливает cookie admin_session=1 так, чтобы она отправлялась на /api/*
    """

    parser_classes = [parsers.JSONParser]

    def post(self, request):
        expected = os.environ.get("ADMIN_PASSWORD") or ""
        body = request.data or {}
        password = str(body.get("password") or "")

        if not expected:
            return Response(
                {"error": "ADMIN_PASSWORD is not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not password or password != expected:
            return Response({"error": "Неверный пароль."}, status=status.HTTP_401_UNAUTHORIZED)

        # Cookie должна читаться Next по server-side cookies()
        response = Response({"ok": True}, status=status.HTTP_200_OK)
        secure = os.environ.get("DJANGO_SECURE_COOKIES", "false").lower() == "true"
        response.set_cookie(
            "admin_session",
            "1",
            httponly=True,
            secure=secure,
            samesite="Lax",
            # Нужна именно на /api/admin/portfolio, т.е. хотя бы на все пути
            path="/",
            max_age=60 * 60 * 8,  # 8 часов
        )
        return response


class AdminLeadsListView(APIView):
    """
    GET /api/admin/leads
    """

    authentication_classes = [AdminCookieAuthentication]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def get(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard

        qs = LeadSubmission.objects.all().order_by("-created_at")
        serializer = LeadSubmissionSerializer(qs, many=True)
        return Response({"leads": serializer.data}, status=status.HTTP_200_OK)


class AdminPortfolioListView(APIView):
    authentication_classes = [AdminCookieAuthentication]
    # Explicitly declare parsers for multipart/form-data uploads.
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def _require_admin(self, request):
        # DRF BaseAuthentication returns None; easiest is cookie check directly.
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def get(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard
        qs = PortfolioProject.objects.all().order_by("-updated_at")
        serializer = PortfolioProjectDetailSerializer(qs, many=True, context={"request": request})
        return Response({"projects": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard

        try:
            data = request.data or {}
            title = str(data.get("title") or "").strip()
            if not title:
                return Response(
                    {"error": "title обязательное поле."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            raw_slug = str(data.get("slug") or "").strip()
            slug = latin_slug_from_text(raw_slug) if raw_slug else latin_slug_from_text(title)
            slug = slug or None

            # Поддерживаем и старый ключ `category` из существующего фронта (на будущее заменим в admin UI).
            project_type = str(data.get("project_type") or data.get("category") or "").strip()

            subtitle = str(data.get("subtitle") or "").strip()
            client_industry = str(data.get("client_industry") or "").strip()
            # Optional: service page binding (e.g., ["web", "crm"]).
            # FormData can send multiple `service_pages` fields.
            if hasattr(data, "getlist"):
                service_pages = [str(x).strip() for x in data.getlist("service_pages") if str(x).strip()]
            else:
                raw = data.get("service_pages")
                if isinstance(raw, list):
                    service_pages = [str(x).strip() for x in raw if str(x).strip()]
                else:
                    service_pages = [s.strip() for s in str(raw or "").split(",") if s.strip()]
            home_filter = str(data.get("home_filter") or "").strip()

            overview = str(data.get("overview") or "").strip()
            problem = str(data.get("problem") or "").strip()
            solution = str(data.get("solution") or "").strip()
            process = str(data.get("process") or "").strip()
            results = str(data.get("results") or "").strip()
            technologies = str(data.get("technologies") or "").strip()
            final = str(data.get("final") or "").strip()

            live_url = str(data.get("live_url") or "").strip() or None
            published = parse_bool(data.get("published"))

            hero_image_url = (
                str(data.get("hero_image_url") or data.get("image_url") or "").strip() or None
            )

            uploaded_file = request.FILES.get("heroImageFile") or request.FILES.get("imageFile")

            if slug:
                # Быстрое сообщение о коллизии (уникальность slug важна для `/portfolio/[slug]`).
                if PortfolioProject.objects.filter(slug=slug).exists():
                    return Response({"error": "slug уже используется."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(
                    {"error": "Не удалось сгенерировать slug. Проверьте title."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            project = PortfolioProject.objects.create(
                slug=slug,
                title=title,
                subtitle=subtitle,
                client_industry=client_industry,
                project_type=project_type,
                service_pages=service_pages,
                home_filter=home_filter,
                live_url=live_url,
                hero_image_url=hero_image_url,
                overview=overview,
                problem=problem,
                solution=solution,
                process=process,
                results=results,
                technologies=technologies,
                final=final,
                published=published,
            )

            if uploaded_file:
                try:
                    project.hero_image = uploaded_file
                    # hero_image_url оставляем, но serializer отдать hero_image при наличии файла.
                    project.save(update_fields=["hero_image"])
                except Exception as e:
                    # Common cause: Pillow can't identify the uploaded image format.
                    return Response(
                        {"error": f"Ошибка загрузки hero_image: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            serializer = PortfolioProjectDetailSerializer(project, context={"request": request})
            return Response({"project": serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminPortfolioUpdateView(APIView):
    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def put(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard

        try:
            project = PortfolioProject.objects.get(id=id)
        except PortfolioProject.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data or {}

        title = str(data.get("title") or project.title).strip()
        if not title:
            return Response({"error": "title обязательное поле."}, status=status.HTTP_400_BAD_REQUEST)

        raw_slug = data.get("slug")
        if raw_slug is not None and str(raw_slug).strip() != "":
            slug = latin_slug_from_text(str(raw_slug).strip()) or None
        else:
            slug = project.slug

        if slug and slug != project.slug:
            if PortfolioProject.objects.filter(slug=slug).exclude(id=project.id).exists():
                return Response({"error": "slug уже используется."}, status=status.HTTP_400_BAD_REQUEST)

        project.project_type = str(data.get("project_type") or data.get("category") or project.project_type or "").strip()
        project.subtitle = str(data.get("subtitle") or project.subtitle or "").strip()
        project.client_industry = str(data.get("client_industry") or project.client_industry or "").strip()

        # Optional: service page binding.
        # Important: if form submits no `service_pages` values (all checkboxes unchecked),
        # we must persist an empty list to allow clearing links.
        if hasattr(data, "getlist"):
            project.service_pages = [str(x).strip() for x in data.getlist("service_pages") if str(x).strip()]
        elif data.get("service_pages") is not None:
            raw = data.get("service_pages")
            if isinstance(raw, list):
                project.service_pages = [str(x).strip() for x in raw if str(x).strip()]
            else:
                project.service_pages = [s.strip() for s in str(raw or "").split(",") if s.strip()]
        if data.get("home_filter") is not None:
            project.home_filter = str(data.get("home_filter") or "").strip()

        project.overview = str(data.get("overview") or data.get("description") or project.overview or "").strip()
        project.problem = str(data.get("problem") or project.problem or "").strip()
        project.solution = str(data.get("solution") or project.solution or "").strip()
        project.process = str(data.get("process") or project.process or "").strip()
        project.results = str(data.get("results") or project.results or "").strip()
        project.technologies = str(data.get("technologies") or project.technologies or "").strip()
        project.final = str(data.get("final") or project.final or "").strip()

        project.live_url = str(data.get("live_url") or project.live_url or "").strip() or None
        project.slug = slug
        project.title = title

        project.published = parse_bool(data.get("published", project.published))

        hero_image_url = (
            str(data.get("hero_image_url") or data.get("image_url") or "").strip()
        )
        if hero_image_url != "":
            project.hero_image_url = hero_image_url
        # uploaded file has priority over url
        uploaded_file = request.FILES.get("heroImageFile") or request.FILES.get("imageFile")
        if uploaded_file:
            project.hero_image = uploaded_file

        project.save()

        serializer = PortfolioProjectDetailSerializer(project, context={"request": request})
        return Response({"project": serializer.data}, status=status.HTTP_200_OK)

    def delete(self, request, id):
        """
        Support DELETE on the same endpoint (with/without trailing slash).
        This makes routing robust for frontend calls.
        """
        guard = self._require_admin(request)
        if guard:
            return guard

        try:
            project = PortfolioProject.objects.get(id=id)
        except PortfolioProject.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        project.delete()
        return Response({"ok": True}, status=status.HTTP_200_OK)


class AdminPortfolioDeleteView(APIView):
    authentication_classes = [AdminCookieAuthentication]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def delete(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard

        try:
            project = PortfolioProject.objects.get(id=id)
        except PortfolioProject.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        project.delete()
        return Response({"ok": True}, status=status.HTTP_200_OK)


class AdminPortfolioImagesListCreateView(APIView):
    """
    GET  /api/admin/portfolio/<uuid:id>/images
    POST /api/admin/portfolio/<uuid:id>/images
    """

    authentication_classes = [AdminCookieAuthentication]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def get(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard

        images = ProjectImage.objects.filter(project_id=id).order_by("sort_order", "created_at")
        serializer = ProjectImageSerializer(images, many=True, context={"request": request})
        return Response({"images": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard

        project = PortfolioProject.objects.filter(id=id).first()
        if not project:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data or {}
        caption = str(data.get("caption") or "").strip()

        block_size = str(data.get("block_size") or PortfolioProject.BLOCK_SIZE_MD).strip()
        object_fit = str(data.get("object_fit") or PortfolioProject.OBJECT_FIT_COVER).strip()
        aspect_ratio = str(data.get("aspect_ratio") or PortfolioProject.ASPECT_AUTO).strip()

        sort_order_raw = data.get("sort_order")
        try:
            sort_order = int(sort_order_raw) if sort_order_raw is not None else 0
        except Exception:
            sort_order = 0

        image_url = str(data.get("image_url") or "").strip() or None
        uploaded_file = request.FILES.get("imageFile") or request.FILES.get("image_file")

        if not uploaded_file and not image_url:
            return Response({"error": "imageFile или image_url обязательны."}, status=status.HTTP_400_BAD_REQUEST)

        image = ProjectImage.objects.create(
            project=project,
            caption=caption,
            block_size=block_size,
            object_fit=object_fit,
            aspect_ratio=aspect_ratio,
            sort_order=sort_order,
            image_url=image_url,
        )
        if uploaded_file:
            image.image_file = uploaded_file
            # Если загружен файл — URL не нужен.
            image.image_url = None
            image.save(update_fields=["image_file", "image_url"])

        serializer = ProjectImageSerializer(image, context={"request": request})
        return Response({"image": serializer.data}, status=status.HTTP_201_CREATED)


class AdminProjectImageUpdateDeleteView(APIView):
    """
    PUT    /api/admin/portfolio/images/<uuid:image_id>/
    DELETE /api/admin/portfolio/images/<uuid:image_id>/
    """

    authentication_classes = [AdminCookieAuthentication]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def put(self, request, image_id):
        guard = self._require_admin(request)
        if guard:
            return guard

        image = ProjectImage.objects.filter(id=image_id).first()
        if not image:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data or {}
        image.caption = str(data.get("caption") or image.caption or "").strip()

        if data.get("block_size"):
            image.block_size = str(data.get("block_size")).strip()
        if data.get("object_fit"):
            image.object_fit = str(data.get("object_fit")).strip()
        if data.get("aspect_ratio") is not None:
            image.aspect_ratio = str(data.get("aspect_ratio")).strip() or image.aspect_ratio

        if data.get("sort_order") is not None:
            try:
                image.sort_order = int(data.get("sort_order"))
            except Exception:
                pass

        image_url = str(data.get("image_url") or "").strip()
        if image_url != "":
            # Если новый URL, заменяем на него. Файл — при наличии заменит на файл позже.
            image.image_url = image_url

        uploaded_file = request.FILES.get("imageFile") or request.FILES.get("image_file")
        if uploaded_file:
            image.image_file = uploaded_file
            image.image_url = None

        image.save()
        serializer = ProjectImageSerializer(image, context={"request": request})
        return Response({"image": serializer.data}, status=status.HTTP_200_OK)

    def delete(self, request, image_id):
        guard = self._require_admin(request)
        if guard:
            return guard

        image = ProjectImage.objects.filter(id=image_id).first()
        if not image:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        image.delete()
        return Response({"ok": True}, status=status.HTTP_200_OK)

