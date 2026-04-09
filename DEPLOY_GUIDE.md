# Tagirov Digital Studio - Production Deploy Guide

## 1) Что уже проверено перед релизом

- Frontend lint: OK (`npm run lint`)
- Django check: OK (`python manage.py check`)
- Production build: OK (`npm run build`)
- Бэкап БД создан: `backups/db-20260408-201248.sqlite3`

## 2) Что нужно подготовить на сервере

- Ubuntu 22.04+ (или аналогичный Linux)
- Python 3.11+
- Node.js 20+
- Nginx
- Домен, направленный на сервер

## 3) Переменные окружения

Создайте файл `.env.local` в корне проекта (рядом с `package.json`):

```env
ADMIN_PASSWORD=your-strong-password
NEXT_PUBLIC_DJANGO_URL=https://your-domain.com
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DJANGO_CORS_ORIGIN=https://your-domain.com

# Optional: email notifications
RESEND_API_KEY=
RESEND_TO_EMAIL=
RESEND_FROM_EMAIL=
```

## 4) Деплой проекта на сервер

### 4.1 Клонирование и установка зависимостей

```bash
git clone https://github.com/Robert0-F/DigitalStudioSite.git /var/www/digitalstudio
cd /var/www/digitalstudio
npm install
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 4.2 Миграции и статика/медиа

```bash
cd /var/www/digitalstudio/backend
source .venv/bin/activate
python manage.py migrate
```

Если переносите вашу текущую БД, см. раздел "Восстановление бэкапа".

### 4.3 Сборка Next.js

```bash
cd /var/www/digitalstudio
npm run build
```

## 5) Systemd сервисы

### 5.1 Django (Gunicorn)

Создайте `/etc/systemd/system/digitalstudio-django.service`:

```ini
[Unit]
Description=DigitalStudio Django (Gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/digitalstudio/backend
EnvironmentFile=/var/www/digitalstudio/.env.local
ExecStart=/var/www/digitalstudio/backend/.venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 3
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 5.2 Next.js

Создайте `/etc/systemd/system/digitalstudio-next.service`:

```ini
[Unit]
Description=DigitalStudio Next.js
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/digitalstudio
EnvironmentFile=/var/www/digitalstudio/.env.local
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Активируйте сервисы:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now digitalstudio-django
sudo systemctl enable --now digitalstudio-next
sudo systemctl status digitalstudio-django
sudo systemctl status digitalstudio-next
```

## 6) Nginx reverse proxy

Создайте `/etc/nginx/sites-available/digitalstudio`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 20M;

    location /media/ {
        alias /var/www/digitalstudio/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включите конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/digitalstudio /etc/nginx/sites-enabled/digitalstudio
sudo nginx -t
sudo systemctl reload nginx
```

## 7) SSL (Let's Encrypt)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 8) Восстановление вашего бэкапа БД

Локальный бэкап, созданный сейчас:

- `backups/db-20260408-201248.sqlite3`

Как восстановить на сервере:

```bash
# На локальной машине
scp /path/to/db-20260408-201248.sqlite3 user@server:/var/www/digitalstudio/backend/

# На сервере
sudo systemctl stop digitalstudio-django
cd /var/www/digitalstudio/backend
mv db.sqlite3 db.sqlite3.before-restore
mv db-20260408-201248.sqlite3 db.sqlite3
sudo chown www-data:www-data db.sqlite3
sudo systemctl start digitalstudio-django
```

## 9) Финальный чек после публикации

- `https://your-domain.com` открывается
- `/portfolio` показывает кейсы
- `/portfolio/<slug>` открывается и показывает контент
- `/admin` -> вход по паролю работает
- `/admin/portfolio` -> CRUD кейсов работает
- `/admin/requests` -> заявки со всех форм приходят
- Загрузка изображений работает, файлы появляются в `backend/media/`
- Фильтры кейсов на главной и на странице портфолио работают
- Модалка заявки открывается без заметных лагов

## 10) Команды для диагностики

```bash
sudo journalctl -u digitalstudio-django -f
sudo journalctl -u digitalstudio-next -f
sudo nginx -t
curl -I https://your-domain.com
curl -I https://your-domain.com/api/portfolio
```

