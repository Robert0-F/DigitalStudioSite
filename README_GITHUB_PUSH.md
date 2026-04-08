# Как отправить проект на GitHub (из Cursor / с ПК)

Вы уже привязали GitHub к Cursor и создали пустой репозиторий на сайте. Ниже — что сделать **по порядку**, чтобы код реально оказался на GitHub.

---

## Шаг 1. Откройте терминал в папке проекта

В Cursor: **Terminal → New Terminal**  
Или PowerShell:

```powershell
cd f:\DigitalStudioSite
```

---

## Шаг 2. Проверьте, что Git видит вашу ветку и коммиты

```powershell
git status
git branch
```

Должна быть ветка, чаще всего `main`. Если есть незакоммиченные изменения:

```powershell
git add .
git commit -m "Initial commit"
```

---

## Шаг 3. Проверьте привязку к GitHub (`remote`)

```powershell
git remote -v
```

**Если строк нет** (пусто) — Git **не знает адрес** вашего репозитория. Тогда добавьте его вручную (подставьте **свой** URL со страницы репозитория на GitHub):

HTTPS:

```powershell
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
```

SSH (если настроили ключи на GitHub):

```powershell
git remote add origin git@github.com:ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
```

**Если уже есть неправильный `origin`**, сначала удалите и добавьте заново:

```powershell
git remote remove origin
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
```

Снова проверьте:

```powershell
git remote -v
```

---

## Шаг 4. Отправьте код на GitHub

```powershell
git push -u origin main
```

Если ваша ветка называется `master`, а не `main`:

```powershell
git push -u origin master
```

После успешного пуша зайдите на страницу репозитория на GitHub — там должны появиться файлы.

---

## Частые проблемы и решения

### 1) «Repository not found» или запрос логина / отказ в доступе

При **HTTPS** GitHub **не принимает обычный пароль**. Нужен **Personal Access Token (PAT)**:

1. Откройте: https://github.com/settings/tokens  
2. **Generate new token** (classic), дайте права **`repo`**.  
3. При `git push` в поле пароля вставьте **токен**, а не пароль от аккаунта.

Либо войдите через **Git Credential Manager** (Windows часто предлагает окно браузера).

### 2) «failed to push … non-fast-forward» или «updates were rejected»

На GitHub при создании репозитория вы могли включить **README / .gitignore / license** — тогда на сервере уже есть коммиты, которых нет локально.

Сделайте один раз (осторожно: перепишет историю только если вы единственный автор и хотите «подтянуть» пустой README):

```powershell
git pull origin main --allow-unrelated-histories
```

Разрешите конфликты, если спросит, затем:

```powershell
git push -u origin main
```

Если репозиторий **полностью пустой** (без файлов на GitHub) — такой проблемы не будет, достаточно `git push`.

### 3) Кнопка «Publish» в Cursor не срабатывает

Часто причина та же: **нет `origin`** или **push падает из‑за авторизации**. Выполните шаги 3–4 в терминале — вы увидите **точный текст ошибки** и сможете исправить по таблице выше.

### 4) Очень долгий push или ошибка про размер файла

Убедитесь, что в репозиторий не попадают тяжёлые папки: в этом проекте в `.gitignore` уже указаны `node_modules`, `.next` и т.д. Не коммитьте случайно архивы или видео в корень без необходимости.

---

## Краткий чеклист

| Действие | Команда |
|----------|---------|
| Папка проекта | `cd f:\DigitalStudioSite` |
| Есть ли remote? | `git remote -v` |
| Добавить remote | `git remote add origin https://github.com/USER/REPO.git` |
| Закоммитить изменения | `git add .` → `git commit -m "..."` |
| Отправить на GitHub | `git push -u origin main` |

---

## Где взять точный URL репозитория

На GitHub: откройте свой репозиторий → зелёная кнопка **Code** → скопируйте **HTTPS** или **SSH** — это и есть адрес для `git remote add origin ...`.

Если после этих шагов ошибка останется — скопируйте **полный текст ошибки из терминала** и по нему можно сказать точное решение на один шаг.
