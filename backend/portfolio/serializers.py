import os
from rest_framework import serializers

from .models import LeadSubmission, PortfolioProject, ProjectImage


def _absolute_url(request, url: str | None) -> str | None:
    if not url:
        return None

    # Если URL уже абсолютный — возвращаем как есть.
    if url.startswith("http://") or url.startswith("https://"):
        return url

    # Основной стабильный вариант: база Django из env (важно при rewrites Next.js).
    base = os.environ.get("NEXT_PUBLIC_DJANGO_URL") or os.environ.get("DJANGO_URL")
    if base:
        if url.startswith("/"):
            return f"{base}{url}"
        return f"{base}/{url}"

    if request is None:
        return url
    return request.build_absolute_uri(url)


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
    overview_excerpt = serializers.SerializerMethodField()

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
            "hero_image_url",
            "overview_excerpt",
            "published",
            "created_at",
            "updated_at",
        ]

    def get_hero_image_url(self, obj: PortfolioProject) -> str | None:
        request = self.context.get("request")
        if obj.hero_image and getattr(obj.hero_image, "url", None):
            return _absolute_url(request, obj.hero_image.url)
        return obj.hero_image_url

    def get_overview_excerpt(self, obj: PortfolioProject) -> str:
        overview = str(obj.overview or "")
        s = overview.strip()
        return s[:100] + ("..." if len(s) > 100 else "")


class PortfolioProjectDetailSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()
    images = ProjectImageSerializer(many=True, read_only=True)

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
            "hero_image_url",
            "live_url",
            "overview",
            "problem",
            "solution",
            "process",
            "results",
            "technologies",
            "final",
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


class LeadSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSubmission
        fields = ["id", "name", "contact", "description", "project_type", "created_at"]

