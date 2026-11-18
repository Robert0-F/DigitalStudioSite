import os
from rest_framework import serializers

from .models import Category, LeadSubmission, PortfolioProject, ProjectImage, SiteSettings


def _absolute_url(request, url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        # Windows: Next image optimizer часто таймаутится на hostname "localhost".
        return url.replace("://localhost:", "://127.0.0.1:").replace("://localhost/", "://127.0.0.1/")
    if not url.startswith("/"):
        url = f"/{url}"
    # /media/* отдаём относительным путём — Next rewrite проксирует на Django.
    if url.startswith("/media/"):
        return url
    base = os.environ.get("NEXT_PUBLIC_DJANGO_URL") or os.environ.get("DJANGO_URL")
    if base:
        base = base.rstrip("/").replace("://localhost:", "://127.0.0.1:").replace("://localhost", "://127.0.0.1")
        return f"{base}{url}"
    if request is None:
        return url
    return request.build_absolute_uri(url)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "sort_order"]


class ProjectImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectImage
        fields = [
            "id",
            "image_url",
            "caption",
            "block_size",
            "object_fit",
            "aspect_ratio",
            "sort_order",
        ]

    def get_image_url(self, obj: ProjectImage) -> str | None:
        request = self.context.get("request")
        if obj.image_file and getattr(obj.image_file, "url", None):
            return _absolute_url(request, obj.image_file.url)
        return obj.image_url


class PortfolioProjectListSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()
    case_hero_image_url = serializers.SerializerMethodField()
    overview_excerpt = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = PortfolioProject
        fields = [
            "id",
            "slug",
            "title",
            "subtitle",
            "client_industry",
            "project_type",
            "service_pages",
            "home_filter",
            "categories",
            "hero_image_url",
            "case_hero_image_url",
            "overview_excerpt",
            "sort_order",
            "show_on_home",
            "published",
            "created_at",
            "updated_at",
        ]

    def get_hero_image_url(self, obj: PortfolioProject) -> str | None:
        request = self.context.get("request")
        if obj.hero_image and getattr(obj.hero_image, "url", None):
            return _absolute_url(request, obj.hero_image.url)
        return obj.hero_image_url

    def get_case_hero_image_url(self, obj: PortfolioProject) -> str | None:
        request = self.context.get("request")
        if obj.case_hero_image and getattr(obj.case_hero_image, "url", None):
            return _absolute_url(request, obj.case_hero_image.url)
        return self.get_hero_image_url(obj)

    def get_overview_excerpt(self, obj: PortfolioProject) -> str:
        overview = str(obj.overview or "")
        s = overview.strip()
        return s[:100] + ("..." if len(s) > 100 else "")


class PortfolioProjectDetailSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()
    case_hero_image_url = serializers.SerializerMethodField()
    images = ProjectImageSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = PortfolioProject
        fields = [
            "id",
            "slug",
            "title",
            "subtitle",
            "client_industry",
            "project_type",
            "service_pages",
            "home_filter",
            "categories",
            "hero_image_url",
            "case_hero_image_url",
            "live_url",
            "video_url",
            "overview",
            "problem",
            "solution",
            "process",
            "results",
            "technologies",
            "final",
            "sort_order",
            "show_on_home",
            "published",
            "created_at",
            "updated_at",
            "images",
        ]

    def get_hero_image_url(self, obj: PortfolioProject) -> str | None:
        request = self.context.get("request")
        if obj.hero_image and getattr(obj.hero_image, "url", None):
            return _absolute_url(request, obj.hero_image.url)
        return obj.hero_image_url

    def get_case_hero_image_url(self, obj: PortfolioProject) -> str | None:
        request = self.context.get("request")
        if obj.case_hero_image and getattr(obj.case_hero_image, "url", None):
            return _absolute_url(request, obj.case_hero_image.url)
        # Fallback: карточка, если отдельный баннер кейса ещё не загружен
        return self.get_hero_image_url(obj)


class LeadSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSubmission
        fields = [
            "id",
            "name",
            "contact",
            "description",
            "project_type",
            "status",
            "created_at",
            "updated_at",
        ]


class SiteSettingsSerializer(serializers.ModelSerializer):
    hero_desktop_image_url = serializers.SerializerMethodField()
    hero_mobile_image_url = serializers.SerializerMethodField()
    logo_image_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
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
            "services_cards",
            "reviews",
            "footer_legal",
            "hero_desktop_image_url",
            "hero_mobile_image_url",
            "logo_image_url",
            "updated_at",
        ]

    def get_hero_desktop_image_url(self, obj: SiteSettings) -> str | None:
        request = self.context.get("request")
        if obj.hero_desktop_image and getattr(obj.hero_desktop_image, "url", None):
            return _absolute_url(request, obj.hero_desktop_image.url)
        return None

    def get_hero_mobile_image_url(self, obj: SiteSettings) -> str | None:
        request = self.context.get("request")
        if obj.hero_mobile_image and getattr(obj.hero_mobile_image, "url", None):
            return _absolute_url(request, obj.hero_mobile_image.url)
        return None

    def get_logo_image_url(self, obj: SiteSettings) -> str | None:
        request = self.context.get("request")
        if obj.logo_image and getattr(obj.logo_image, "url", None):
            return _absolute_url(request, obj.logo_image.url)
        return None
