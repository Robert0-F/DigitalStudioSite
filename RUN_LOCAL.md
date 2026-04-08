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

### Admin password (Next + Django)

In the **project root** `.env.local` (next to `package.json`):

```env
ADMIN_PASSWORD=your-strong-password
```

Django loads this file on startup (same vars as Next).

Resend (optional; if missing, backend still accepts submissions):

```env
RESEND_API_KEY=...
RESEND_TO_EMAIL=...
RESEND_FROM_EMAIL=...
```

## 4) Start Django

In `backend/`:

```bash
python manage.py migrate
python manage.py runserver 8000
```

## 5) Start Next.js

In project root:

```bash
npm run dev
```

Open:
- `http://localhost:3000` (site)
- `http://localhost:3000/admin` (admin panel)

## Admin panel: how to set the password

1. Put `ADMIN_PASSWORD=...` in **project root** `.env.local` (not inside `backend/`). Django loads it via `python-dotenv`.
2. Run `pip install -r requirements.txt` (includes `python-dotenv`).
3. Restart Django (`python manage.py runserver 8000`).
4. Open `/admin` and enter the password.

**Or** set the env var in the shell before Django: `set ADMIN_PASSWORD=...` (Windows CMD) / `$env:ADMIN_PASSWORD="..."` (PowerShell) / `export ADMIN_PASSWORD=...` (macOS/Linux).

## Портфолио (публично) и админка

- Публичные страницы:
  - `/portfolio` — список опубликованных кейсов
  - `/portfolio/<slug>` — страница конкретного кейса
- Админка:
  - `/admin/portfolio` — CRUD проектов и управление изображениями (защищено тем же `ADMIN_PASSWORD`)

Если вы обновляли схему моделей портфолио (или хотите снова заполнить демо-контент):

```bash
cd backend
python manage.py migrate
python manage.py seed_portfolio
```

После этого обновите вкладки:
- `http://localhost:3000/portfolio`
- `http://localhost:3000/admin/portfolio`

