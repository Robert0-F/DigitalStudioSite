# Tagirov Digital Studio

Витрина студии: **сайты (Tilda)**, **веб-системы**, **ИИ-агенты**, **Яндекс/Авито**, **Telegram-боты**.  
Стек: **Next.js 15** (App Router) + **Django / DRF** (портфолио, заявки, настройки сайта, админ-API).

Репозиторий: https://github.com/Robert0-F/DigitalStudioSite

---

## Что внутри

| Часть | Путь |
|--------|------|
| Frontend | корень (`app/`, `components/`, `lib/`) |
| Backend | `backend/` (Django + SQLite + `media/`) |
| Контент главной | `/admin/settings` + дефолты в `lib/siteContent.js` |
| Портфолио | `/admin/portfolio` (обложка карточки + баннер страницы кейса) |
| Фото / логотипы | `backend/media/` (в git, чтобы сервер сразу получил картинки) |

---

## 1. Залить актуальный код на GitHub (с ПК)

Подробный разбор ошибок push: [README_GITHUB_PUSH.md](./README_GITHUB_PUSH.md).

```powershell
cd f:\DigitalStudioSite

git status
git add -A
# не коммитьте .env.local — он в .gitignore

git commit -m "Paper Operator redesign, site settings, agents, case hero covers"

git push origin main
```

Remote уже должен быть:

```text
origin  https://github.com/Robert0-F/DigitalStudioSite.git
```

Проверка: обновите страницу репозитория на GitHub — должны появиться новые файлы, `backend/media/`, миграции `0007`–`0011`.

---

## 2. Обновить сервер (код + фото из Git)

Кратко после каждого push. Полный чеклист прав/SQLite/media: [README_SERVER_UPDATE.md](./README_SERVER_UPDATE.md). Первичный деплой: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md).

```bash
cd /var/www/digitalstudio
git pull origin main

# Frontend
npm install
npm run build
sudo systemctl restart digitalstudio-next

# Backend
cd /var/www/digitalstudio/backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
sudo chown -R www-data:www-data /var/www/digitalstudio/backend
sudo chmod -R u+rwX /var/www/digitalstudio/backend/media
sudo systemctl restart digitalstudio-django
```

### Важно про `.env.local` на сервере

Файл **не** из git. На сервере он уже лежит (или создайте из `.env.example`):

```bash
# /var/www/digitalstudio/.env.local
NEXT_PUBLIC_DJANGO_URL=https://ВАШ_ДОМЕН
NEXT_PUBLIC_SITE_URL=https://ВАШ_ДОМЕН
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=ВАШ_ДОМЕН,www.ВАШ_ДОМЕН
DJANGO_CORS_ORIGIN=https://ВАШ_ДОМЕН
DJANGO_SECURE_COOKIES=true
DJANGO_SECRET_KEY=длинный-секрет
ADMIN_PASSWORD=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

После смены `NEXT_PUBLIC_*` обязательно снова `npm run build` и restart Next.

### Картинки и БД

- В репозитории есть **`backend/media/`** и **`backend/db.sqlite3`** с локальным контентом.
- `git pull` подтянет фото и настройки. Если на сервере уже своя рабочая БД с другими данными — **не затирайте** её слепо: сделайте бэкап `db.sqlite3` перед pull или не коммитьте локальную БД в следующий раз.
- Nginx должен отдавать `/media/` из `backend/media/` (см. DEPLOY_GUIDE). Next также умеет rewrite `/media/*` → Django.

---

## 3. Локальный запуск

Подробно: [RUN_LOCAL.md](./RUN_LOCAL.md).

```bash
# Frontend
npm install
npm run dev

# Backend (второй терминал)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Скопируйте `.env.example` → `.env.local` в корне.

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_DJANGO_URL` | Django (rewrite `/api/*`, `/media/*`) |
| `NEXT_PUBLIC_SITE_URL` | Канон сайта (sitemap / OG) |
| `NEXT_PUBLIC_TELEGRAM_URL` | CTA Telegram |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | Метрика |
| `ADMIN_PASSWORD` | Bootstrap админки |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Уведомления о заявках |

---

## Админка и контент

| URL | Что править |
|-----|-------------|
| `/admin/settings` | Hero, плашка услуг, тексты карточек услуг, trust, цены, отзывы, логотип, обложки макетов, ссылка в «браузере» |
| `/admin/portfolio` | Кейсы: обложка карточки + **баннер страницы кейса**, галерея |
| `/admin/requests` | Заявки |

Дефолты текстов: `lib/siteContent.js`. Палитра: `app/globals.css`, `tailwind.config.js`.

---

## Публичные URL

| Путь | Содержание |
|---|---|
| `/` | Главная |
| `/portfolio`, `/portfolio/[slug]` | Портфолио и кейс |
| `/services/tilda\|django\|agents\|telegram\|marketing` | Услуги |
| `/sitemap.xml`, `/robots.txt` | SEO |

---

## Чеклист «всё ли на месте перед деплоем»

- [ ] `git status` чистый после commit (нет забытых `migrations/0007`–`0011`)
- [ ] В git есть `backend/media/` (фото кейсов / site logo)
- [ ] `.env.local` **нет** в git
- [ ] На сервере после pull: `migrate` + `npm run build` + restart обоих unit’ов
- [ ] Права `www-data` на `backend/` и `backend/media/`
- [ ] Сайт открывается по HTTPS, картинки с `/media/...` грузятся

---

© Tagirov Digital Studio
