from django.apps import AppConfig


class PortfolioConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "portfolio"

    def ready(self):
        from .media_utils import ensure_media_dirs

        ensure_media_dirs()

