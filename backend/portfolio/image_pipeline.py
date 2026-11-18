import io
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile, UploadedFile

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover
    Image = None
    ImageOps = None

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_SIDE = 2560
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}


def validate_image_upload(uploaded: UploadedFile | None) -> None:
    if not uploaded:
        return
    size = getattr(uploaded, "size", 0) or 0
    if size > MAX_UPLOAD_BYTES:
        raise ValueError("Файл больше 8 МБ. Сожмите изображение и попробуйте снова.")
    content_type = getattr(uploaded, "content_type", "") or ""
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("Допустимы только JPEG, PNG, WebP или GIF.")


def process_image_to_webp(uploaded: UploadedFile, basename: str = "image") -> ContentFile:
    """Resize + convert to WebP. Falls back to original bytes if Pillow missing."""
    validate_image_upload(uploaded)
    if Image is None:
        uploaded.seek(0)
        return ContentFile(uploaded.read(), name=f"{basename}.bin")

    uploaded.seek(0)
    img = Image.open(uploaded)
    img = ImageOps.exif_transpose(img)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

    w, h = img.size
    scale = min(1.0, MAX_SIDE / float(max(w, h)))
    if scale < 1.0:
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    if img.mode == "RGBA":
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    else:
        img = img.convert("RGB")

    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=90, method=4)
    return ContentFile(buf.getvalue(), name=f"{Path(basename).stem}.webp")


def assign_processed_image(field, uploaded: UploadedFile, basename: str) -> None:
    processed = process_image_to_webp(uploaded, basename=basename)
    field.save(processed.name, processed, save=False)
