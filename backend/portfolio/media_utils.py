import os
from pathlib import Path

from django.conf import settings


def ensure_media_dirs() -> None:
    """Create upload folders if missing (needed on fresh server deploy)."""
    root = Path(settings.MEDIA_ROOT)
    for sub in ("portfolio/hero", "portfolio/images"):
        (root / sub).mkdir(parents=True, exist_ok=True)


def media_writable() -> tuple[bool, str]:
    ensure_media_dirs()
    root = Path(settings.MEDIA_ROOT)
    test_path = root / ".write_test"
    try:
        test_path.write_text("ok", encoding="utf-8")
        test_path.unlink(missing_ok=True)
        return True, ""
    except OSError as e:
        return False, str(e)


def safe_delete_filefield(file_field) -> None:
    if not file_field:
        return
    try:
        file_field.delete(save=False)
    except OSError:
        pass
    except Exception:
        pass
