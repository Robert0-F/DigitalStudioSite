# Обновление кода на сервере (Git + Next.js + Django)

Этот файл для быстрых обновлений после новых коммитов в `main`.

## 1) Подключитесь к серверу и перейдите в проект

```bash
cd /var/www/digitalstudio
```

## 2) Заберите новые изменения из GitHub

```bash
git status
git pull origin main
```

Если `git pull` не проходит из-за локальных изменений:

```bash
git stash
git pull origin main
git stash pop
```

## 3) Обновите frontend (Next.js)

```bash
cd /var/www/digitalstudio
npm install
npm run build
sudo systemctl restart digitalstudio-next
```

## 4) Обновите backend (Django)

```bash
cd /var/www/digitalstudio/backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
sudo systemctl restart digitalstudio-django
```

## 5) Проверка сервисов

```bash
sudo systemctl status digitalstudio-next
sudo systemctl status digitalstudio-django
sudo systemctl status nginx
```

Логи в реальном времени:

```bash
sudo journalctl -u digitalstudio-next -f
sudo journalctl -u digitalstudio-django -f
```

## Важно про ошибку build и Django

Раньше `next build` мог падать на этапе `Collecting page data`, если Django был недоступен.

Теперь в коде добавлена защита (try/catch) в:

- `app/portfolio/[slug]/page.js`
- `app/portfolio/page.js`

Поэтому при временно недоступном Django сборка не падает, а страницы портфолио собираются безопасно с пустыми данными.

