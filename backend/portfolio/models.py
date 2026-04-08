import uuid

from django.db import models


class PortfolioProject(models.Model):
    """
    Проект/кейс студии.
    Public-сайт читает только опубликованные проекты, а admin управляет всеми полями.
    """

    # Тип проекта (витрина)
    PROJECT_TYPE_WEBSITES = "websites"
    PROJECT_TYPE_LANDING = "landing"
    PROJECT_TYPE_ECOMMERCE = "ecommerce"
    PROJECT_TYPE_CRM = "crm"
    PROJECT_TYPE_DIGITAL_PRODUCT = "digital_product"
    PROJECT_TYPE_BRANDING = "branding"

    PROJECT_TYPE_CHOICES = [
        (PROJECT_TYPE_WEBSITES, "websites"),
        (PROJECT_TYPE_LANDING, "landing"),
        (PROJECT_TYPE_ECOMMERCE, "ecommerce"),
        (PROJECT_TYPE_CRM, "crm"),
        (PROJECT_TYPE_DIGITAL_PRODUCT, "digital_product"),
        (PROJECT_TYPE_BRANDING, "branding"),
    ]

    # Галерея: размер блока на странице кейса
    BLOCK_SIZE_SM = "sm"
    BLOCK_SIZE_MD = "md"
    BLOCK_SIZE_LG = "lg"
    BLOCK_SIZE_FULL = "full"

    BLOCK_SIZE_CHOICES = [
        (BLOCK_SIZE_SM, "sm"),
        (BLOCK_SIZE_MD, "md"),
        (BLOCK_SIZE_LG, "lg"),
        (BLOCK_SIZE_FULL, "full"),
    ]

    # Галерея: как отрисовывать изображение внутри блока
    OBJECT_FIT_COVER = "cover"
    OBJECT_FIT_CONTAIN = "contain"

    OBJECT_FIT_CHOICES = [
        (OBJECT_FIT_COVER, "cover"),
        (OBJECT_FIT_CONTAIN, "contain"),
    ]

    # Галерея: грубая настройка формы/пропорций контейнера (опционально)
    ASPECT_AUTO = "auto"
    ASPECT_SQUARE = "square"
    ASPECT_VIDEO = "video"
    ASPECT_PORTRAIT = "portrait"

    ASPECT_RATIO_CHOICES = [
        (ASPECT_AUTO, "auto"),
        (ASPECT_SQUARE, "square"),
        (ASPECT_VIDEO, "video"),
        (ASPECT_PORTRAIT, "portrait"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # URL slug кейса
    slug = models.SlugField(max_length=220, unique=True, null=True, blank=True)

    # Заголовки / контент
    title = models.CharField(max_length=220)
    subtitle = models.CharField(max_length=220, blank=True, default="")
    client_industry = models.CharField(max_length=220, blank=True, default="")
    project_type = models.CharField(
        max_length=40, choices=PROJECT_TYPE_CHOICES, blank=True, default=""
    )

    # Hero
    hero_image = models.ImageField(
        upload_to="portfolio/hero/", null=True, blank=True
    )
    hero_image_url = models.URLField(max_length=2048, null=True, blank=True)

    live_url = models.URLField(max_length=2048, null=True, blank=True)

    # Секции кейса (все optional — если поле пустое, на фронте секция не рендерится)
    overview = models.TextField(blank=True, default="")
    problem = models.TextField(blank=True, default="")
    solution = models.TextField(blank=True, default="")
    process = models.TextField(blank=True, default="")  # line breaks / simple HTML later
    results = models.TextField(blank=True, default="")
    technologies = models.TextField(blank=True, default="")
    final = models.TextField(blank=True, default="")

    # Привязка кейса к страницам услуг (опционально).
    # Пример: ["web", "crm"]. Если пусто — кейс показываем только в общем портфолио.
    service_pages = models.JSONField(default=list, blank=True)

    published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["published"]), models.Index(fields=["slug"])]

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    """
    Дополнительные изображения для кейса.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        PortfolioProject, related_name="images", on_delete=models.CASCADE
    )

    image_file = models.ImageField(
        upload_to="portfolio/images/", null=True, blank=True
    )
    image_url = models.URLField(max_length=2048, null=True, blank=True)

    caption = models.TextField(blank=True, default="")

    block_size = models.CharField(
        max_length=10,
        choices=PortfolioProject.BLOCK_SIZE_CHOICES,
        default=PortfolioProject.BLOCK_SIZE_MD,
    )
    object_fit = models.CharField(
        max_length=10,
        choices=PortfolioProject.OBJECT_FIT_CHOICES,
        default=PortfolioProject.OBJECT_FIT_COVER,
    )
    aspect_ratio = models.CharField(
        max_length=20,
        choices=PortfolioProject.ASPECT_RATIO_CHOICES,
        default=PortfolioProject.ASPECT_AUTO,
        blank=True,
    )

    sort_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "created_at"]
        indexes = [models.Index(fields=["project"]), models.Index(fields=["sort_order"])]

    def __str__(self):
        return f"Image for {self.project_id}"


class LeadSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=200)  # email / phone / Telegram / etc.
    description = models.TextField(blank=True)
    project_type = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["created_at"])]

