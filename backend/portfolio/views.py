import os

import requests
from rest_framework import parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .auth import AdminCookieAuthentication
from .image_pipeline import assign_processed_image, validate_image_upload
from .media_utils import ensure_media_dirs, media_writable, safe_delete_filefield
from .models import Category, LeadSubmission, PortfolioProject, ProjectImage, SiteSettings
from .serializers import (
    CategorySerializer,
    LeadSubmissionSerializer,
    PortfolioProjectDetailSerializer,
    PortfolioProjectListSerializer,
    ProjectImageSerializer,
    SiteSettingsSerializer,
)
from .slug_utils import latin_slug_from_text
from .telegram_notify import notify_telegram_lead


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


def _media_upload_guard():
    ensure_media_dirs()
    ok, err = media_writable()
    if not ok:
        return Response(
            {
                "error": (
                    "Нет прав на запись в папку media. "
                    f"На сервере выполните: sudo chown -R www-data:www-data backend/media. ({err})"
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    return None


def _delete_project_safe(project: PortfolioProject) -> None:
    for image in list(project.images.all()):
        safe_delete_filefield(image.image_file)
        ProjectImage.objects.filter(pk=image.pk).delete()
    safe_delete_filefield(project.hero_image)
    safe_delete_filefield(project.case_hero_image)
    PortfolioProject.objects.filter(pk=project.pk).delete()


def _delete_image_safe(image: ProjectImage) -> None:
    safe_delete_filefield(image.image_file)
    ProjectImage.objects.filter(pk=image.pk).delete()


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

        LeadSubmission.objects.create(
            name=name,
            contact=contact,
            description=description,
            project_type=project_type,
        )
        notify_telegram_lead(
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
        qs = PortfolioProject.objects.filter(published=True).order_by("sort_order", "-updated_at")
        if str(request.query_params.get("home") or "").lower() in ("1", "true", "yes"):
            qs = qs.filter(show_on_home=True)
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


def _set_admin_cookies(response, request, user=None):
    secure = os.environ.get("DJANGO_SECURE_COOKIES", "false").lower() == "true"
    if user is not None:
        login(request, user)
    response.set_cookie(
        "admin_session",
        "1",
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/",
        max_age=60 * 60 * 8,
    )
    return response


@method_decorator(csrf_exempt, name="dispatch")
class AdminAuthView(APIView):
    """
    POST /api/admin/auth
    Предпочтительно: username + password (Django User).
    Fallback: только password == ADMIN_PASSWORD (создаёт/логинит пользователя admin).
    """

    parser_classes = [parsers.JSONParser]
    authentication_classes = []

    def post(self, request):
        body = request.data or {}
        username = str(body.get("username") or "").strip()
        password = str(body.get("password") or "")

        user = None
        expected = os.environ.get("ADMIN_PASSWORD") or ""

        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None and (not user.is_active or not user.is_staff):
                user = None

        # Legacy / bootstrap: ADMIN_PASSWORD matches → ensure staff user exists.
        if user is None and expected and password and password == expected:
            uname = username or "admin"
            user, _ = User.objects.get_or_create(
                username=uname,
                defaults={"is_staff": True, "is_superuser": True},
            )
            if not user.has_usable_password() or not user.check_password(password):
                user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()

        if user is None:
            return Response({"error": "Неверный логин или пароль."}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({"ok": True, "username": user.username}, status=status.HTTP_200_OK)
        return _set_admin_cookies(response, request, user=user)

    def delete(self, request):
        logout(request)
        response = Response({"ok": True}, status=status.HTTP_200_OK)
        response.delete_cookie("admin_session", path="/")
        return response


class AdminLeadsListView(APIView):
    """
    GET /api/admin/leads
    PATCH /api/admin/leads/<uuid>  — via AdminLeadUpdateView
    """

    authentication_classes = [AdminCookieAuthentication]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1" and not (
            getattr(request, "user", None) and request.user.is_authenticated and request.user.is_staff
        ):
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def get(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard

        qs = LeadSubmission.objects.all().order_by("-created_at")
        serializer = LeadSubmissionSerializer(qs, many=True)
        return Response({"leads": serializer.data}, status=status.HTTP_200_OK)


class AdminLeadUpdateView(APIView):
    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def patch(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard
        lead = LeadSubmission.objects.filter(id=id).first()
        if not lead:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        status_value = str(request.data.get("status") or "").strip()
        allowed = {c[0] for c in LeadSubmission.STATUS_CHOICES}
        if status_value not in allowed:
            return Response({"error": "Некорректный статус."}, status=status.HTTP_400_BAD_REQUEST)
        lead.status = status_value
        lead.save(update_fields=["status", "updated_at"])
        return Response({"lead": LeadSubmissionSerializer(lead).data}, status=status.HTTP_200_OK)


class AdminCategoriesView(APIView):
    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def get(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard
        qs = Category.objects.all().order_by("sort_order", "name")
        return Response({"categories": CategorySerializer(qs, many=True).data})

    def post(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard
        name = str(request.data.get("name") or "").strip()
        slug = latin_slug_from_text(str(request.data.get("slug") or name))
        if not name or not slug:
            return Response({"error": "name и slug обязательны."}, status=status.HTTP_400_BAD_REQUEST)
        if Category.objects.filter(slug=slug).exists():
            return Response({"error": "slug уже используется."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            sort_order = int(request.data.get("sort_order") or 0)
        except Exception:
            sort_order = 0
        cat = Category.objects.create(name=name, slug=slug, sort_order=sort_order)
        return Response({"category": CategorySerializer(cat).data}, status=status.HTTP_201_CREATED)


class AdminCategoryDetailView(APIView):
    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def put(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard
        cat = Category.objects.filter(id=id).first()
        if not cat:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        if request.data.get("name") is not None:
            cat.name = str(request.data.get("name") or "").strip() or cat.name
        if request.data.get("slug") is not None:
            slug = latin_slug_from_text(str(request.data.get("slug") or ""))
            if slug:
                cat.slug = slug
        if request.data.get("sort_order") is not None:
            try:
                cat.sort_order = int(request.data.get("sort_order"))
            except Exception:
                pass
        cat.save()
        return Response({"category": CategorySerializer(cat).data})

    def delete(self, request, id):
        guard = self._require_admin(request)
        if guard:
            return guard
        cat = Category.objects.filter(id=id).first()
        if not cat:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        cat.delete()
        return Response({"ok": True})


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
            video_url = str(data.get("video_url") or "").strip() or None
            published = parse_bool(data.get("published"))
            show_on_home = parse_bool(data.get("show_on_home", True))
            try:
                project_sort = int(data.get("sort_order") or 0)
            except Exception:
                project_sort = 0

            hero_image_url = (
                str(data.get("hero_image_url") or data.get("image_url") or "").strip() or None
            )

            uploaded_file = request.FILES.get("heroImageFile") or request.FILES.get("imageFile")

            if uploaded_file:
                media_guard = _media_upload_guard()
                if media_guard:
                    return media_guard

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
                video_url=video_url,
                hero_image_url=hero_image_url,
                overview=overview,
                problem=problem,
                solution=solution,
                process=process,
                results=results,
                technologies=technologies,
                final=final,
                published=published,
                show_on_home=show_on_home,
                sort_order=project_sort,
            )

            if hasattr(data, "getlist"):
                cat_slugs = [str(x).strip() for x in data.getlist("category_slugs") if str(x).strip()]
            else:
                raw_cats = data.get("category_slugs")
                if isinstance(raw_cats, list):
                    cat_slugs = [str(x).strip() for x in raw_cats if str(x).strip()]
                else:
                    cat_slugs = [s.strip() for s in str(raw_cats or "").split(",") if s.strip()]
            if cat_slugs:
                project.categories.set(list(Category.objects.filter(slug__in=cat_slugs)))

            if uploaded_file:
                try:
                    validate_image_upload(uploaded_file)
                    assign_processed_image(project.hero_image, uploaded_file, basename="hero")
                    project.save(update_fields=["hero_image"])
                except Exception as e:
                    project.delete()
                    return Response(
                        {"error": f"Ошибка загрузки hero_image: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            case_uploaded = request.FILES.get("caseHeroImageFile")
            if case_uploaded:
                try:
                    validate_image_upload(case_uploaded)
                    assign_processed_image(project.case_hero_image, case_uploaded, basename="case-hero")
                    project.save(update_fields=["case_hero_image"])
                except Exception as e:
                    project.delete()
                    return Response(
                        {"error": f"Ошибка загрузки case_hero_image: {str(e)}"},
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

        try:
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
            if data.get("video_url") is not None:
                project.video_url = str(data.get("video_url") or "").strip() or None
            project.slug = slug
            project.title = title

            project.published = parse_bool(data.get("published", project.published))
            if data.get("show_on_home") is not None:
                project.show_on_home = parse_bool(data.get("show_on_home"))
            if data.get("sort_order") is not None:
                try:
                    project.sort_order = int(data.get("sort_order"))
                except Exception:
                    pass

            hero_image_url = (
                str(data.get("hero_image_url") or data.get("image_url") or "").strip()
            )
            if hero_image_url != "":
                project.hero_image_url = hero_image_url

            uploaded_file = request.FILES.get("heroImageFile") or request.FILES.get("imageFile")
            if uploaded_file:
                media_guard = _media_upload_guard()
                if media_guard:
                    return media_guard
                try:
                    if project.hero_image:
                        safe_delete_filefield(project.hero_image)
                    validate_image_upload(uploaded_file)
                    assign_processed_image(project.hero_image, uploaded_file, basename="hero")
                except Exception as e:
                    return Response(
                        {"error": f"Ошибка загрузки hero_image: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            case_uploaded = request.FILES.get("caseHeroImageFile")
            if case_uploaded:
                media_guard = _media_upload_guard()
                if media_guard:
                    return media_guard
                try:
                    if project.case_hero_image:
                        safe_delete_filefield(project.case_hero_image)
                    validate_image_upload(case_uploaded)
                    assign_processed_image(project.case_hero_image, case_uploaded, basename="case-hero")
                except Exception as e:
                    return Response(
                        {"error": f"Ошибка загрузки case_hero_image: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            if parse_bool(data.get("clear_case_hero")):
                if project.case_hero_image:
                    safe_delete_filefield(project.case_hero_image)
                    project.case_hero_image = None

            project.save()

            if data.get("_set_categories") is not None or data.get("category_slugs") is not None:
                if hasattr(data, "getlist"):
                    slugs = [str(x).strip() for x in data.getlist("category_slugs") if str(x).strip()]
                else:
                    raw = data.get("category_slugs")
                    if isinstance(raw, list):
                        slugs = [str(x).strip() for x in raw if str(x).strip()]
                    else:
                        slugs = [s.strip() for s in str(raw or "").split(",") if s.strip()]
                project.categories.set(list(Category.objects.filter(slug__in=slugs)))

            serializer = PortfolioProjectDetailSerializer(project, context={"request": request})
            return Response({"project": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        try:
            _delete_project_safe(project)
            return Response({"ok": True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

        try:
            _delete_project_safe(project)
            return Response({"ok": True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminPortfolioImagesListCreateView(APIView):
    """
    GET  /api/admin/portfolio/<uuid:id>/images
    POST /api/admin/portfolio/<uuid:id>/images
    """

    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

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

        try:
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

            if uploaded_file:
                media_guard = _media_upload_guard()
                if media_guard:
                    return media_guard

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
                try:
                    validate_image_upload(uploaded_file)
                    assign_processed_image(image.image_file, uploaded_file, basename="gallery")
                    image.image_url = None
                    image.save(update_fields=["image_file", "image_url"])
                except Exception as e:
                    image.delete()
                    return Response(
                        {"error": f"Ошибка загрузки изображения: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            serializer = ProjectImageSerializer(image, context={"request": request})
            return Response({"image": serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminProjectImageUpdateDeleteView(APIView):
    """
    PUT    /api/admin/portfolio/images/<uuid:image_id>/
    DELETE /api/admin/portfolio/images/<uuid:image_id>/
    """

    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

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

        try:
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
                image.image_url = image_url

            uploaded_file = request.FILES.get("imageFile") or request.FILES.get("image_file")
            if uploaded_file:
                media_guard = _media_upload_guard()
                if media_guard:
                    return media_guard
                try:
                    if image.image_file:
                        safe_delete_filefield(image.image_file)
                    validate_image_upload(uploaded_file)
                    assign_processed_image(image.image_file, uploaded_file, basename="gallery")
                    image.image_url = None
                except Exception as e:
                    return Response(
                        {"error": f"Ошибка загрузки изображения: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            image.save()
            serializer = ProjectImageSerializer(image, context={"request": request})
            return Response({"image": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, image_id):
        guard = self._require_admin(request)
        if guard:
            return guard

        image = ProjectImage.objects.filter(id=image_id).first()
        if not image:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            _delete_image_safe(image)
            return Response({"ok": True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicSiteSettingsView(APIView):
    """GET /api/site-settings — публичные настройки витрины."""

    authentication_classes = []

    def get(self, request):
        settings_obj = SiteSettings.get_solo()
        return Response(
            {"settings": SiteSettingsSerializer(settings_obj, context={"request": request}).data},
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name="dispatch")
class AdminSiteSettingsView(APIView):
    """
    GET/PUT /api/admin/site-settings
    Multipart: текстовые поля + heroDesktopFile / heroMobileFile / logoFile
    """

    authentication_classes = [AdminCookieAuthentication]
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def _require_admin(self, request):
        if request.COOKIES.get("admin_session") != "1":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        return None

    def get(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard
        settings_obj = SiteSettings.get_solo()
        return Response(
            {"settings": SiteSettingsSerializer(settings_obj, context={"request": request}).data},
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        guard = self._require_admin(request)
        if guard:
            return guard

        settings_obj = SiteSettings.get_solo()
        data = request.data or {}

        text_fields = [
            "hero_title",
            "hero_subtitle",
            "hero_primary_cta",
            "hero_secondary_cta",
            "hero_browser_label",
            "hero_browser_url",
            "trust_years_value",
            "trust_years_label",
            "trust_projects_value",
            "trust_projects_label",
            "trust_stack_value",
            "trust_stack_label",
            "price_tilda",
            "price_django",
            "price_agents",
            "price_telegram",
            "price_marketing",
            "price_start",
            "price_growth",
            "price_system",
            "services_heading",
            "services_subtitle",
            "footer_legal",
        ]
        for key in text_fields:
            if key in data:
                value = str(data.get(key) or "").strip()
                if key == "hero_browser_url" and value and not value.startswith(("http://", "https://")):
                    value = f"https://{value}"
                setattr(settings_obj, key, value)

        if "services_cards" in data:
            raw_cards = data.get("services_cards")
            if isinstance(raw_cards, str):
                import json

                try:
                    raw_cards = json.loads(raw_cards)
                except Exception:
                    raw_cards = []
            if isinstance(raw_cards, list):
                allowed_ids = {"tilda", "django", "agents", "marketing", "telegram"}
                cleaned_cards = []
                for item in raw_cards:
                    if not isinstance(item, dict):
                        continue
                    cid = str(item.get("id") or "").strip()
                    if cid not in allowed_ids:
                        continue
                    cleaned_cards.append(
                        {
                            "id": cid,
                            "title": str(item.get("title") or "").strip(),
                            "outcome": str(item.get("outcome") or "").strip(),
                            "forWhom": str(item.get("forWhom") or item.get("for_whom") or "").strip(),
                        }
                    )
                settings_obj.services_cards = cleaned_cards

        if "reviews" in data:
            raw = data.get("reviews")
            if isinstance(raw, str):
                import json

                try:
                    raw = json.loads(raw)
                except Exception:
                    raw = []
            if isinstance(raw, list):
                cleaned = []
                for item in raw:
                    if not isinstance(item, dict):
                        continue
                    text = str(item.get("text") or "").strip()
                    author = str(item.get("author") or "").strip()
                    if not text or not author:
                        continue
                    cleaned.append(
                        {
                            "id": str(item.get("id") or f"r{len(cleaned)+1}"),
                            "text": text,
                            "author": author,
                            "role": str(item.get("role") or "").strip(),
                        }
                    )
                settings_obj.reviews = cleaned

        desktop_file = request.FILES.get("heroDesktopFile")
        mobile_file = request.FILES.get("heroMobileFile")
        logo_file = request.FILES.get("logoFile")

        if desktop_file or mobile_file or logo_file:
            media_guard = _media_upload_guard()
            if media_guard:
                return media_guard

        try:
            if desktop_file:
                validate_image_upload(desktop_file)
                if settings_obj.hero_desktop_image:
                    safe_delete_filefield(settings_obj.hero_desktop_image)
                assign_processed_image(settings_obj.hero_desktop_image, desktop_file, basename="hero-desktop")
            if mobile_file:
                validate_image_upload(mobile_file)
                if settings_obj.hero_mobile_image:
                    safe_delete_filefield(settings_obj.hero_mobile_image)
                assign_processed_image(settings_obj.hero_mobile_image, mobile_file, basename="hero-mobile")
            if logo_file:
                if settings_obj.logo_image:
                    safe_delete_filefield(settings_obj.logo_image)
                logo_name = (getattr(logo_file, "name", "") or "").lower()
                logo_ctype = (getattr(logo_file, "content_type", "") or "").lower()
                is_svg = logo_name.endswith(".svg") or logo_ctype in (
                    "image/svg+xml",
                    "image/svg",
                    "text/xml",
                    "application/xml",
                )
                if is_svg:
                    # SVG сохраняем как есть — Pillow/WebP его не обрабатывает.
                    settings_obj.logo_image.save("logo.svg", logo_file, save=False)
                else:
                    validate_image_upload(logo_file)
                    assign_processed_image(settings_obj.logo_image, logo_file, basename="logo")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if parse_bool(data.get("clear_hero_desktop")):
            if settings_obj.hero_desktop_image:
                safe_delete_filefield(settings_obj.hero_desktop_image)
                settings_obj.hero_desktop_image = None
        if parse_bool(data.get("clear_hero_mobile")):
            if settings_obj.hero_mobile_image:
                safe_delete_filefield(settings_obj.hero_mobile_image)
                settings_obj.hero_mobile_image = None
        if parse_bool(data.get("clear_logo")):
            if settings_obj.logo_image:
                safe_delete_filefield(settings_obj.logo_image)
                settings_obj.logo_image = None

        settings_obj.save()
        return Response(
            {"settings": SiteSettingsSerializer(settings_obj, context={"request": request}).data},
            status=status.HTTP_200_OK,
        )

