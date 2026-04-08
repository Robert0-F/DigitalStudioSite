import io

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image

from portfolio.models import PortfolioProject, ProjectImage
from portfolio.slug_utils import latin_slug_from_text


def _make_solid_png_bytes(label: str, width: int, height: int, rgb: tuple[int, int, int]) -> bytes:
    """
    Placeholder image generator.

    We intentionally avoid rendering Russian text into the PNG
    to keep font-availability issues out of the seed process.
    """

    img = Image.new("RGB", (width, height), rgb)
    # subtle diagonal stripes for a "premium" feel
    for x in range(0, width, 18):
        for y in range(0, height):
            if (x + y) % 36 == 0:
                img.putpixel((x, y), (255, 255, 255))

    # We do not write label text (font issues), but keep param for future.
    _ = label

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _aspect_dims(aspect_ratio: str) -> tuple[int, int]:
    # Width/height pairs used only for placeholder generation.
    if aspect_ratio == "square":
        return (1000, 1000)
    if aspect_ratio == "portrait":
        return (720, 1280)
    if aspect_ratio == "video":
        return (1280, 720)
    # auto fallback
    return (1000, 800)


class Command(BaseCommand):
    help = "Seed initial portfolio projects (demo content)."

    def handle(self, *args, **options):
        projects = [
            {
                "title": "Банкетный зал «Сююмбике»",
                "subtitle": "Сайт для банкетного зала «Сююмбике»: поток заявок на мероприятия через современную презентацию площадки",
                "client_industry": "Событийная индустрия",
                "project_type": "landing",
                "service_pages": ["web"],
                "published": True,
                "overview": (
                    "Банкетный зал «Сююмбике» — площадка для свадеб, корпоративов и частных мероприятий.\n"
                    "Основная задача — создать сайт, который не просто показывает интерьер, а убеждает клиента оставить заявку.\n\n"
                    "Проект был реализован как продающий одностраничный сайт с акцентом на визуальную атмосферу, удобство выбора и быстрый контакт."
                ),
                "problem": (
                    "До разработки:\n"
                    "у клиента отсутствовал современный сайт\n\n"
                    "заявки приходили нерегулярно\n\n"
                    "площадка не раскрывала свои преимущества онлайн\n\n"
                    "пользователи не понимали вместимость, условия и формат мероприятий\n\n"
                    "отсутствовал удобный способ быстро связаться\n\n"
                    "Для event-ниши это критично — выбор площадки происходит быстро и эмоционально."
                ),
                "solution": (
                    "Был разработан сайт, ориентированный на конверсию посетителей в заявки.\n\n"
                    "Ключевые решения:\n\n"
                    "эффектный первый экран с атмосферной подачей\n\n"
                    "чёткое позиционирование площадки\n\n"
                    "демонстрация интерьеров и сервировки\n\n"
                    "блоки с преимуществами\n\n"
                    "понятная структура для принятия решения\n\n"
                    "акцент на мобильную версию\n\n"
                    "быстрые способы связи\n\n"
                    "Особое внимание уделено тому, чтобы посетитель мог представить своё мероприятие именно в этом зале."
                ),
                "process": (
                    "Анализ ниши и конкурентов\n\n"
                    "Определение сценария поведения клиента\n\n"
                    "Проработка структуры продающей страницы\n\n"
                    "Дизайн с акцентом на визуальную атмосферу\n\n"
                    "Разработка и адаптация под мобильные устройства\n\n"
                    "Тестирование и запуск"
                ),
                "results": (
                    "Сайт стал полноценным инструментом продаж:\n\n"
                    "формирует первое впечатление о площадке\n\n"
                    "повышает доверие к бизнесу\n\n"
                    "облегчает выбор для клиента\n\n"
                    "стимулирует обращения через сайт\n\n"
                    "позволяет показывать зал без личной встречи"
                ),
                "technologies": (
                    "Современный адаптивный дизайн\n\n"
                    "Оптимизация скорости загрузки\n\n"
                    "SEO-базовая оптимизация\n\n"
                    "Кроссбраузерная совместимость"
                ),
                "final": (
                    "Создан сайт, который работает как цифровой менеджер по продажам — показывает зал, отвечает на ключевые вопросы и подводит клиента к бронированию."
                ),
                "palette": {
                    "hero": (48, 48, 80),
                    "img1": (72, 60, 130),
                    "img2": (34, 90, 120),
                    "img3": (90, 60, 34),
                    "img4": (45, 110, 70),
                },
                "images": [
                    {"block_size": "full", "object_fit": "cover", "aspect_ratio": "video", "sort_order": 0},
                    {"block_size": "lg", "object_fit": "cover", "aspect_ratio": "square", "sort_order": 1},
                    {"block_size": "md", "object_fit": "cover", "aspect_ratio": "video", "sort_order": 2},
                    {"block_size": "sm", "object_fit": "cover", "aspect_ratio": "portrait", "sort_order": 3},
                ],
            },
            {
                "title": "Кейтеринг «Сююмбике»",
                "subtitle": "Сайт для кейтеринговой службы «Сююмбике»: презентация услуг выездного обслуживания мероприятий",
                "client_industry": "Кейтеринг и выездное обслуживание",
                "project_type": "landing",
                "service_pages": ["web"],
                "published": True,
                "overview": (
                    "Кейтеринговая служба предоставляет организацию питания для мероприятий различного формата — от частных праздников до корпоративных событий.\n\n"
                    "Задача — создать сайт, который демонстрирует уровень сервиса и помогает быстро понять, подходит ли услуга под конкретное событие."
                ),
                "problem": (
                    "До запуска сайта:\n\n"
                    "услуга плохо раскрывалась онлайн\n\n"
                    "клиентам было сложно представить формат работы\n\n"
                    "отсутствовала системная презентация меню и возможностей\n\n"
                    "обращения происходили хаотично\n\n"
                    "бизнес зависел от рекомендаций"
                ),
                "solution": (
                    "Разработан одностраничный сайт с акцентом на понятность и доверие.\n\n"
                    "Основные элементы:\n\n"
                    "чёткое объяснение форматов обслуживания\n\n"
                    "визуальная демонстрация сервировки и блюд\n\n"
                    "блоки для разных типов мероприятий\n\n"
                    "преимущества сервиса\n\n"
                    "простой сценарий заказа\n\n"
                    "акцент на оперативную связь\n\n"
                    "Сайт ориентирован на быстрые решения — пользователь сразу понимает, подходит ли услуга под его событие."
                ),
                "process": (
                    "Исследование потребностей клиентов кейтеринга\n\n"
                    "Проработка структуры страницы\n\n"
                    "Дизайн с акцентом на аппетитную визуальную подачу\n\n"
                    "Разработка адаптивной версии\n\n"
                    "Оптимизация под мобильный трафик"
                ),
                "results": (
                    "Сайт стал инструментом презентации услуг:\n\n"
                    "повышает доверие к бренду\n\n"
                    "демонстрирует профессиональный уровень\n\n"
                    "упрощает выбор для клиента\n\n"
                    "увеличивает количество обращений\n\n"
                    "снижает количество неподходящих запросов"
                ),
                "technologies": (
                    "Адаптивная верстка\n\n"
                    "Быстрая загрузка\n\n"
                    "SEO-базовая оптимизация\n\n"
                    "Удобная навигация"
                ),
                "final": (
                    "Создан сайт, который превращает сложную услугу в понятное предложение и помогает клиенту принять решение без долгих переговоров."
                ),
                "palette": {
                    "hero": (70, 40, 70),
                    "img1": (100, 90, 35),
                    "img2": (40, 90, 140),
                    "img3": (120, 50, 50),
                    "img4": (40, 120, 90),
                },
                "images": [
                    {"block_size": "full", "object_fit": "cover", "aspect_ratio": "video", "sort_order": 0},
                    {"block_size": "lg", "object_fit": "cover", "aspect_ratio": "square", "sort_order": 1},
                    {"block_size": "md", "object_fit": "cover", "aspect_ratio": "video", "sort_order": 2},
                    {"block_size": "sm", "object_fit": "cover", "aspect_ratio": "portrait", "sort_order": 3},
                ],
            },
            {
                "title": "Система сбора вторичного сырья",
                "subtitle": "Веб-система автоматизации сбора вторичного сырья: цифровая платформа для управления процессами",
                "client_industry": "Сбор и переработка вторичного сырья",
                "project_type": "digital_product",
                "service_pages": ["crm"],
                "published": True,
                "overview": (
                    "Проект представляет собой систему для автоматизированного сбора и учёта вторичного сырья.\n\n"
                    "Задача — создать инструмент, который упрощает взаимодействие между участниками процесса и снижает ручной труд."
                ),
                "problem": (
                    "До внедрения системы:\n\n"
                    "процессы велись вручную\n\n"
                    "данные хранились разрозненно\n\n"
                    "сложно отслеживать объёмы и эффективность\n\n"
                    "отсутствовала прозрачность операций\n\n"
                    "высокий риск ошибок\n\n"
                    "Для логистики и переработки это критично."
                ),
                "solution": (
                    "Разработана веб-система, объединяющая ключевые процессы в единой платформе.\n\n"
                    "Функциональность включала:\n\n"
                    "учёт поступающего сырья\n\n"
                    "структурирование данных\n\n"
                    "удобный интерфейс работы\n\n"
                    "автоматизацию операций\n\n"
                    "повышение прозрачности процессов\n\n"
                    "сокращение ручных действий\n\n"
                    "Интерфейс спроектирован так, чтобы сотрудники могли быстро освоить систему без длительного обучения."
                ),
                "process": (
                    "Анализ бизнес-процессов\n\n"
                    "Проектирование архитектуры системы\n\n"
                    "Разработка интерфейса\n\n"
                    "Реализация функционала\n\n"
                    "Тестирование\n\n"
                    "Внедрение"
                ),
                "results": (
                    "Система позволила:\n\n"
                    "упорядочить работу с данными\n\n"
                    "сократить ручной труд\n\n"
                    "повысить точность учёта\n\n"
                    "ускорить операции\n\n"
                    "создать основу для масштабирования"
                ),
                "technologies": (
                    "Веб-приложение\n\n"
                    "Серверная логика\n\n"
                    "Работа с базой данных\n\n"
                    "Защищённый доступ\n\n"
                    "Адаптивный интерфейс"
                ),
                # В вашем сообщении для кейса 3 блок 🔥 Итог не был указан,
                # поэтому оставляем final пустым (секцию на странице можно не рендерить).
                "final": "",
                "palette": {
                    "hero": (30, 60, 90),
                    "img1": (30, 120, 150),
                    "img2": (90, 60, 150),
                    "img3": (150, 80, 30),
                    "img4": (40, 100, 60),
                },
                "images": [
                    {"block_size": "full", "object_fit": "cover", "aspect_ratio": "video", "sort_order": 0},
                    {"block_size": "lg", "object_fit": "cover", "aspect_ratio": "video", "sort_order": 1},
                    {"block_size": "md", "object_fit": "cover", "aspect_ratio": "square", "sort_order": 2},
                    {"block_size": "sm", "object_fit": "cover", "aspect_ratio": "portrait", "sort_order": 3},
                ],
            },
        ]

        with transaction.atomic():
            for p in projects:
                slug = latin_slug_from_text(p["title"])

                project, _ = PortfolioProject.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": p["title"],
                        "subtitle": p.get("subtitle", ""),
                        "client_industry": p.get("client_industry", ""),
                        "project_type": p.get("project_type", ""),
                        "service_pages": p.get("service_pages", []),
                        "published": bool(p.get("published", False)),
                        "overview": p.get("overview", ""),
                        "problem": p.get("problem", ""),
                        "solution": p.get("solution", ""),
                        "process": p.get("process", ""),
                        "results": p.get("results", ""),
                        "technologies": p.get("technologies", ""),
                        "final": p.get("final", ""),
                    },
                )

                # Hero image
                if p.get("palette") and (not project.hero_image and not project.hero_image_url):
                    hero_rgb = p["palette"]["hero"]
                    w, h = (1280, 720)
                    hero_bytes = _make_solid_png_bytes(slug, w, h, hero_rgb)
                    project.hero_image.save(f"{slug}-hero.png", ContentFile(hero_bytes), save=True)

                # Project images
                ProjectImage.objects.filter(project_id=project.id).delete()

                img_defs = p.get("images", [])
                for idx, img_def in enumerate(img_defs):
                    aspect_ratio = img_def.get("aspect_ratio") or "auto"
                    w, h = _aspect_dims(aspect_ratio)

                    rgb_key = f"img{idx+1}"
                    rgb = (90, 90, 90)
                    if p.get("palette") and rgb_key in p["palette"]:
                        rgb = p["palette"][rgb_key]

                    bytes_png = _make_solid_png_bytes(slug + f"-{idx}", w, h, rgb)

                    image = ProjectImage.objects.create(
                        project=project,
                        caption="",
                        block_size=img_def.get("block_size", "md"),
                        object_fit=img_def.get("object_fit", "cover"),
                        aspect_ratio=aspect_ratio,
                        sort_order=int(img_def.get("sort_order", idx)),
                    )
                    image.image_file.save(
                        f"{slug}-img-{idx+1}.png", ContentFile(bytes_png), save=True
                    )

        self.stdout.write(self.style.SUCCESS("Portfolio seed completed successfully."))

