# Деплой Tagirov Digital Studio (Linux)

Домен в примерах: **tagirovweb.ru**  
Путь на сервере: **`/var/www/digitalstudio`**  
Репозиторий: **https://github.com/Robert0-F/DigitalStudioSite.git**

Все команды ниже — копируй и выполняй по порядку в SSH (bash).  
Файлы создаются командами `tee` / `nano`, не «вручную в редакторе Windows».

---

## A. Если сайт уже стоит — только обновить из GitHub

Подключись по SSH и выполни:

```bash
ssh root@IP_СЕРВЕРА
# или: ssh USER@IP_СЕРВЕРА
```

```bash
cd /var/www/digitalstudio

# бэкап БД на всякий случай
sudo cp -a backend/db.sqlite3 "backend/db.sqlite3.bak-$(date +%F-%H%M)"

git status
git pull origin main

cd /var/www/digitalstudio
npm install
npm run build
sudo systemctl restart digitalstudio-next

cd /var/www/digitalstudio/backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

sudo mkdir -p /var/www/digitalstudio/backend/media/portfolio/hero
sudo mkdir -p /var/www/digitalstudio/backend/media/portfolio/images
sudo mkdir -p /var/www/digitalstudio/backend/media/portfolio/case-hero
sudo mkdir -p /var/www/digitalstudio/backend/media/site/logo
sudo mkdir -p /var/www/digitalstudio/backend/media/site/hero

sudo chown -R www-data:www-data /var/www/digitalstudio/backend
sudo chmod u+rwx /var/www/digitalstudio/backend
sudo chmod u+rw /var/www/digitalstudio/backend/db.sqlite3
sudo chmod -R u+rwX,g+rwX /var/www/digitalstudio/backend/media
sudo chmod u+rw /var/www/digitalstudio/backend/db.sqlite3-* 2>/dev/null || true

sudo systemctl restart digitalstudio-django
sudo systemctl restart digitalstudio-next

sudo systemctl status digitalstudio-django --no-pager
sudo systemctl status digitalstudio-next --no-pager
```

### Если картинки «есть», но не показываются

На сервере выполни проверки:

```bash
# 1) Файл реально на диске?
sudo ls -la /var/www/digitalstudio/backend/media/portfolio/hero/ | head

# 2) Django (Gunicorn) отдаёт media? (должно быть 200)
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/media/portfolio/hero/hero_IWoWyHq.webp

# 3) Nginx отдаёт media с домена?
curl -sS -o /dev/null -w "%{http_code}\n" https://tagirovweb.ru/media/portfolio/hero/hero_IWoWyHq.webp

# 4) В JSON путь относительный /media/...?
curl -sS https://tagirovweb.ru/api/portfolio | head -c 400
echo
```

Потом **обязательно** `git pull` + `npm run build` + restart обоих сервисов (фикс: Django раздаёт media при `DEBUG=false`, Next Image ходит на `127.0.0.1:8000`, не на публичный HTTPS).

В `.env.local` можно явно добавить (не обязательно, дефолт и так такой):

```bash
grep DJANGO_INTERNAL_URL /var/www/digitalstudio/.env.local || echo 'DJANGO_INTERNAL_URL=http://127.0.0.1:8000' | sudo tee -a /var/www/digitalstudio/.env.local
```

Проверка в браузере:

```bash
curl -I https://tagirovweb.ru
curl -I https://tagirovweb.ru/api/portfolio
curl -I https://tagirovweb.ru/media/site/logo/logo.svg
```

Готово. Разделы B–H ниже — **первый полный деплой** или если сервисы/Nginx ещё не настроены.

---

## B. Первый деплой: пакеты на сервере

```bash
sudo apt update
sudo apt install -y git curl nginx python3 python3-venv python3-pip build-essential

# Node.js 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node -v
npm -v
python3 --version
```

---

## C. Клонирование репозитория

```bash
sudo mkdir -p /var/www
sudo git clone https://github.com/Robert0-F/DigitalStudioSite.git /var/www/digitalstudio
cd /var/www/digitalstudio
sudo chown -R "$USER":"$USER" /var/www/digitalstudio
```

Если папка уже есть и это git-репо:

```bash
cd /var/www/digitalstudio
git pull origin main
```

---

## D. Файл окружения `.env.local`

Создай файл **целиком командой** (подставь свои секреты вместо CHANGE_ME):

```bash
cd /var/www/digitalstudio

cat > .env.local <<'EOF'
NEXT_PUBLIC_DJANGO_URL=https://tagirovweb.ru
NEXT_PUBLIC_SITE_URL=https://tagirovweb.ru
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/robertprog
NEXT_PUBLIC_YANDEX_METRIKA_ID=

# Next rewrite /api и /media → локальный Gunicorn (не публичный URL!)
DJANGO_INTERNAL_URL=http://127.0.0.1:8000

DJANGO_SECRET_KEY=CHANGE_ME_LONG_RANDOM_SECRET
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=tagirovweb.ru,www.tagirovweb.ru,127.0.0.1,localhost
DJANGO_CORS_ORIGIN=https://tagirovweb.ru
DJANGO_SECURE_COOKIES=true

ADMIN_PASSWORD=CHANGE_ME_ADMIN_PASSWORD

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

RESEND_API_KEY=
RESEND_TO_EMAIL=
RESEND_FROM_EMAIL=
EOF
```

Проверить, что файл на месте:

```bash
ls -la /var/www/digitalstudio/.env.local
nano /var/www/digitalstudio/.env.local
# Ctrl+O Enter — сохранить, Ctrl+X — выйти
```

Права (чтобы www-data читал, посторонние не читали):

```bash
sudo chown root:www-data /var/www/digitalstudio/.env.local
sudo chmod 640 /var/www/digitalstudio/.env.local
```

---

## E. Backend (venv, pip, migrate)

```bash
cd /var/www/digitalstudio/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

python manage.py migrate
deactivate
```

Папки media + права:

```bash
sudo mkdir -p /var/www/digitalstudio/backend/media/portfolio/hero
sudo mkdir -p /var/www/digitalstudio/backend/media/portfolio/images
sudo mkdir -p /var/www/digitalstudio/backend/media/portfolio/case-hero
sudo mkdir -p /var/www/digitalstudio/backend/media/site/logo
sudo mkdir -p /var/www/digitalstudio/backend/media/site/hero

sudo chown -R www-data:www-data /var/www/digitalstudio/backend
sudo chmod u+rwx /var/www/digitalstudio/backend
sudo chmod u+rw /var/www/digitalstudio/backend/db.sqlite3
sudo chmod -R u+rwX,g+rwX /var/www/digitalstudio/backend/media
```

---

## F. Frontend (npm + build)

```bash
cd /var/www/digitalstudio
npm install
npm run build
```

Если build ругается на права у `.next`:

```bash
sudo chown -R "$USER":"$USER" /var/www/digitalstudio
npm run build
sudo chown -R www-data:www-data /var/www/digitalstudio
```

---

## G. Systemd: Django (Gunicorn)

Создать unit-файл **командой**:

```bash
sudo tee /etc/systemd/system/digitalstudio-django.service >/dev/null <<'EOF'
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
EOF
```

Проверить содержимое:

```bash
sudo cat /etc/systemd/system/digitalstudio-django.service
```

---

## H. Systemd: Next.js

```bash
sudo tee /etc/systemd/system/digitalstudio-next.service >/dev/null <<'EOF'
[Unit]
Description=DigitalStudio Next.js
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/digitalstudio
EnvironmentFile=/var/www/digitalstudio/.env.local
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Проверить:

```bash
sudo cat /etc/systemd/system/digitalstudio-next.service
```

Включить и запустить оба сервиса:

```bash
sudo systemctl daemon-reload
sudo systemctl enable digitalstudio-django
sudo systemctl enable digitalstudio-next
sudo systemctl restart digitalstudio-django
sudo systemctl restart digitalstudio-next

sudo systemctl status digitalstudio-django --no-pager
sudo systemctl status digitalstudio-next --no-pager
```

Локальная проверка портов:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/api/portfolio
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

Ожидаемо `200` (или `401` только на admin-эндпоинтах).

---

## I. Nginx (сайт + /media + /api)

Создать конфиг сайта:

```bash
sudo tee /etc/nginx/sites-available/digitalstudio >/dev/null <<'EOF'
server {
    listen 80;
    server_name tagirovweb.ru www.tagirovweb.ru;

    client_max_body_size 20M;

    location /media/ {
        alias /var/www/digitalstudio/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

Включить сайт и перезагрузить Nginx:

```bash
sudo ln -sfn /etc/nginx/sites-available/digitalstudio /etc/nginx/sites-enabled/digitalstudio

# если мешает дефолтный сайт:
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

Проверка по HTTP:

```bash
curl -I http://tagirovweb.ru
curl -I http://tagirovweb.ru/api/portfolio
```

---

## J. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tagirovweb.ru -d www.tagirovweb.ru
```

Следуй вопросам certbot (email, Agree). После успеха:

```bash
curl -I https://tagirovweb.ru
curl -I https://tagirovweb.ru/api/portfolio
curl -I https://tagirovweb.ru/media/site/logo/logo.svg
```

Автообновление сертификата обычно уже в timer:

```bash
sudo systemctl status certbot.timer --no-pager
```

---

## K. Права после любой правки кода / фото

```bash
sudo chown -R www-data:www-data /var/www/digitalstudio/backend
sudo chmod u+rwx /var/www/digitalstudio/backend
sudo chmod u+rw /var/www/digitalstudio/backend/db.sqlite3
sudo chmod -R u+rwX,g+rwX /var/www/digitalstudio/backend/media
sudo systemctl restart digitalstudio-django
```

Если Next не стартует из‑за прав на `.next` / `node_modules`:

```bash
sudo chown -R www-data:www-data /var/www/digitalstudio
sudo systemctl restart digitalstudio-next
```

---

## L. Изменить конфиг / env позже

Редактировать env:

```bash
sudo nano /var/www/digitalstudio/.env.local
```

После смены `NEXT_PUBLIC_*` **обязательно**:

```bash
cd /var/www/digitalstudio
sudo -u www-data npm run build
# если нет прав у www-data на запись — собери от своего юзера, потом chown:
# npm run build
# sudo chown -R www-data:www-data /var/www/digitalstudio
sudo systemctl restart digitalstudio-next
sudo systemctl restart digitalstudio-django
```

Редактировать systemd:

```bash
sudo nano /etc/systemd/system/digitalstudio-django.service
sudo nano /etc/systemd/system/digitalstudio-next.service
sudo systemctl daemon-reload
sudo systemctl restart digitalstudio-django
sudo systemctl restart digitalstudio-next
```

Редактировать Nginx:

```bash
sudo nano /etc/nginx/sites-available/digitalstudio
sudo nginx -t
sudo systemctl reload nginx
```

---

## M. Логи и диагностика

```bash
sudo journalctl -u digitalstudio-django -n 100 --no-pager
sudo journalctl -u digitalstudio-next -n 100 --no-pager
sudo journalctl -u digitalstudio-django -f
sudo journalctl -u digitalstudio-next -f

sudo nginx -t
sudo tail -n 100 /var/log/nginx/error.log

ss -lntp | grep -E ':80|:443|:3000|:8000'
```

Частые коды:

| Симптом | Что проверить |
|--------|----------------|
| 502 Bad Gateway | `systemctl status digitalstudio-next` / `digitalstudio-django` |
| readonly database | раздел K (права на `backend/` и `db.sqlite3`) |
| картинки 404 | `ls /var/www/digitalstudio/backend/media/...` + `location /media/` в Nginx |
| админка 500 при upload | права на `backend/media` у `www-data` |
| старый дизайн после pull | не сделали `npm run build` или не restart Next |

---

## N. Чеклист после деплоя

- [ ] `https://tagirovweb.ru` открывается
- [ ] `/portfolio` показывает кейсы с фото
- [ ] `/portfolio/<slug>` — баннер кейса виден
- [ ] `/admin` — вход работает
- [ ] `/admin/settings` — сохранение логотипа/текстов
- [ ] `/admin/portfolio` — загрузка обложки карточки и баннера кейса
- [ ] `/admin/requests` — заявки приходят
- [ ] Telegram-уведомления (если заданы `TELEGRAM_*`)

---

## O. Связанные файлы

- Быстрый `git pull` на проде: [README_SERVER_UPDATE.md](./README_SERVER_UPDATE.md)
- Push с ПК: [README_GITHUB_PUSH.md](./README_GITHUB_PUSH.md)
- Обзор проекта: [README.md](./README.md)
