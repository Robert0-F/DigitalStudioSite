import uuid

from django.db import models


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class PortfolioProject(models.Model):
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

    OBJECT_FIT_COVER = "cover"
    OBJECT_FIT_CONTAIN = "contain"
    OBJECT_FIT_CHOICES = [
        (OBJECT_FIT_COVER, "cover"),
        (OBJECT_FIT_CONTAIN, "contain"),
    ]

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
    slug = models.SlugField(max_length=220, unique=True, null=True, blank=True)
    title = models.CharField(max_length=220)
    subtitle = models.CharField(max_length=220, blank=True, default="")
    client_industry = models.CharField(max_length=220, blank=True, default="")
    project_type = models.CharField(
        max_length=40, choices=PROJECT_TYPE_CHOICES, blank=True, default=""
    )

    hero_image = models.ImageField(upload_to="portfolio/hero/", null=True, blank=True)
    hero_image_url = models.URLField(max_length=2048, null=True, blank=True)
    # Широкий баннер на странице кейса (/portfolio/[slug]); если пусто — берём hero_image.
    case_hero_image = models.ImageField(upload_to="portfolio/case-hero/", null=True, blank=True)
    live_url = models.URLField(max_length=2048, null=True, blank=True)
    video_url = models.URLField(max_length=2048, null=True, blank=True)

    overview = models.TextField(blank=True, default="")
    problem = models.TextField(blank=True, default="")
    solution = models.TextField(blank=True, default="")
    process = models.TextField(blank=True, default="")
    results = models.TextField(blank=True, default="")
    technologies = models.TextField(blank=True, default="")
    final = models.TextField(blank=True, default="")

    service_pages = models.JSONField(default=list, blank=True)
    home_filter = models.CharField(max_length=20, blank=True, default="")
    categories = models.ManyToManyField(Category, blank=True, related_name="projects")

    sort_order = models.IntegerField(default=0)
    show_on_home = models.BooleanField(default=True)
    published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-updated_at"]
        indexes = [
            models.Index(fields=["published"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["sort_order"]),
            models.Index(fields=["show_on_home"]),
        ]

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        PortfolioProject, related_name="images", on_delete=models.CASCADE
    )
    image_file = models.ImageField(upload_to="portfolio/images/", null=True, blank=True)
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
    STATUS_NEW = "new"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_CLOSED = "closed"
    STATUS_CHOICES = [
        (STATUS_NEW, "Новая"),
        (STATUS_IN_PROGRESS, "В работе"),
        (STATUS_CLOSED, "Закрыта"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project_type = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["created_at"]), models.Index(fields=["status"])]


class SiteSettings(models.Model):
    """
    Singleton (pk=1): тексты/цифры/цены/отзывы главной + hero-обложки + логотип.
    """

    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)

    hero_title = models.CharField(max_length=300, blank=True, default="")
    hero_subtitle = models.TextField(blank=True, default="")
    hero_primary_cta = models.CharField(max_length=120, blank=True, default="")
    hero_secondary_cta = models.CharField(max_length=120, blank=True, default="")
    # Подпись в chrome браузера на hero + кликабельная ссылка (новая вкладка).
    hero_browser_label = models.CharField(max_length=160, blank=True, default="")
    hero_browser_url = models.URLField(max_length=2048, blank=True, default="")

    trust_years_value = models.CharField(max_length=40, blank=True, default="")
    trust_years_label = models.CharField(max_length=120, blank=True, default="")
    trust_projects_value = models.CharField(max_length=40, blank=True, default="")
    trust_projects_label = models.CharField(max_length=120, blank=True, default="")
    trust_stack_value = models.CharField(max_length=80, blank=True, default="")
    trust_stack_label = models.CharField(max_length=120, blank=True, default="")

    price_tilda = models.CharField(max_length=40, blank=True, default="")
    price_django = models.CharField(max_length=40, blank=True, default="")
    price_agents = models.CharField(max_length=40, blank=True, default="")
    price_telegram = models.CharField(max_length=40, blank=True, default="")
    price_marketing = models.CharField(max_length=40, blank=True, default="")
    price_start = models.CharField(max_length=40, blank=True, default="")
    price_growth = models.CharField(max_length=40, blank=True, default="")
    price_system = models.CharField(max_length=40, blank=True, default="")

    # Блок услуг на главной: заголовок секции + тексты карточек (JSON).
    services_heading = models.CharField(max_length=300, blank=True, default="")
    services_subtitle = models.TextField(blank=True, default="")
    # [{id, title, outcome, forWhom}, ...] — id: tilda|django|agents|marketing|telegram
    services_cards = models.JSONField(default=list, blank=True)

    reviews = models.JSONField(default=list, blank=True)
    footer_legal = models.CharField(max_length=240, blank=True, default="")

    hero_desktop_image = models.ImageField(upload_to="site/hero/", null=True, blank=True)
    hero_mobile_image = models.ImageField(upload_to="site/hero/", null=True, blank=True)
    # FileField: допускаем SVG логотип (ImageField + Pillow его не принимают).
    logo_image = models.FileField(upload_to="site/logo/", null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return "Site settings"

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
