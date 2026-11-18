# Run Frontend (Next.js) + Backend (Django) Locally

Now the **backend** lives in `backend/` (Django), and the **frontend** is this Next.js project.

- Next.js: `http://localhost:3000`
- Django API: `http://localhost:8000`

Next.js proxies all requests from `/api/*` to Django via `rewrites` in `next.config.mjs`.

## Prerequisites

- Node.js installed
- Python 3 installed
- Ports available: `3000` and `8000`

## 1) Next.js: install dependencies

```bash
npm install
```

## 2) Backend: install dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 3) Environment variables

### Frontend (optional)

In `.env.local`:

```env
NEXT_PUBLIC_DJANGO_URL=http://localhost:8000
```

Скопируйте [`.env.example`](./.env.example) в `.env.local` в корне проекта. Минимум:

```env
NEXT_PUBLIC_DJANGO_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=your-strong-password
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
NEXT_PUBLIC_YANDEX_METRIKA_ID=
```

Django подхватывает корневой `.env.local` через `python-dotenv`.

Resend (опционально; без него заявки всё равно сохраняются в БД + Telegram):

```env
RESEND_API_KEY=...
RESEND_TO_EMAIL=...
RESEND_FROM_EMAIL=...
```

## 4) Start Django

In `backend/`:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

`createsuperuser` создаёт staff-пользователя для входа в `/admin` (логин + пароль).  
`ADMIN_PASSWORD` остаётся как bootstrap/legacy: если пароль совпал, пользователь `admin` создаётся/обновляется автоматически.

## 5) Start Next.js

In project root:

```bash
npm run dev
```

Open:
- `http://localhost:3000` — сайт
- `http://localhost:3000/admin` — кабинет (кейсы + заявки)

## Портфолио и админка

- `/portfolio`, `/portfolio/<slug>` — публичные кейсы
- `/admin/portfolio` — CRUD + галерея (WebP)
- `/admin/requests` — заявки и статусы
- Тексты витрины: `lib/siteContent.js` (`TODO_*`)

Опционально демо-контент:

```bash
cd backend
python manage.py migrate
python manage.py seed_portfolio
```

