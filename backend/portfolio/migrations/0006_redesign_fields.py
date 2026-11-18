import uuid

from django.db import migrations, models


def seed_categories(apps, schema_editor):
    Category = apps.get_model("portfolio", "Category")
    defaults = [
        ("Tilda", "tilda", 0),
        ("Django", "django", 1),
        ("Telegram", "telegram", 2),
        ("Маркетинг", "marketing", 3),
    ]
    for name, slug, order in defaults:
        Category.objects.get_or_create(slug=slug, defaults={"name": name, "sort_order": order})


class Migration(migrations.Migration):
    dependencies = [
        ("portfolio", "0005_portfolioproject_home_filter"),
    ]

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("sort_order", models.IntegerField(default=0)),
            ],
            options={"ordering": ["sort_order", "name"]},
        ),
        migrations.AddField(
            model_name="leadsubmission",
            name="status",
            field=models.CharField(
                choices=[("new", "Новая"), ("in_progress", "В работе"), ("closed", "Закрыта")],
                default="new",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="leadsubmission",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="portfolioproject",
            name="show_on_home",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="portfolioproject",
            name="sort_order",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="portfolioproject",
            name="video_url",
            field=models.URLField(blank=True, max_length=2048, null=True),
        ),
        migrations.AddField(
            model_name="portfolioproject",
            name="categories",
            field=models.ManyToManyField(blank=True, related_name="projects", to="portfolio.category"),
        ),
        migrations.RunPython(seed_categories, migrations.RunPython.noop),
    ]
