# Деплой TV Space на Vercel + Render

## Схема
| Часть | Платформа |
|---|---|
| Frontend (React/Vite) | Vercel |
| Backend (Spring Boot) | Render (Docker) |
| База PostgreSQL | Render (managed Postgres) |

## Шаг 1. Выложить код на GitHub

Нужен аккаунт GitHub и пустой репозиторий (например `tvshop`).

В папке проекта `C:\Users\Иван\Desktop\AIGHS`:
```powershell
git init
git add .
git commit -m "TV Space"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/tvshop.git
git push -u origin main
```

## Шаг 2. Backend на Render

1. Зайди на render.com → «New» → «Web Service» → подключи GitHub-репозиторий.
2. **Root Directory** = `backend`, Runtime = **Docker** (Dockerfile уже в папке backend).
3. Создай базу: Render → «New» → «PostgreSQL» (бесплатный тариф).
4. В настройках Web Service добавь **Environment Variables** (значения host/user/password возьми из карточки PostgreSQL → «Connections» → «Internal»):

| Переменная | Значение |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>:5432/<dbname>` |
| `SPRING_DATASOURCE_USERNAME` | `<user>` |
| `SPRING_DATASOURCE_PASSWORD` | `<password>` |
| `JWT_SECRET` | любая длинная случайная строка |
| `CORS_ORIGINS` | `https://<твой-фронт>.vercel.app` |
| `BASE_URL` | `https://<твой-бэк>.onrender.com` |

5. Нажми Deploy. Бэкенд поднимется по адресу вида `https://tvshop-backend.onrender.com`.

## Шаг 3. Frontend на Vercel

1. Зайди на vercel.com → «Add New» → «Project» → импорт GitHub-репозитория.
2. **Root Directory** = `frontend`. Framework определится сам (Vite).
3. Добавь **Environment Variable**:

| Переменная | Значение |
|---|---|
| `VITE_API_URL` | `https://<твой-бэк>.onrender.com/api` |

4. Нажми Deploy. Сайт будет на `https://<имя>.vercel.app`.

## Готово

Открой Vercel-адрес — сайт работает в интернете, HTTPS подключён автоматически.

## Важные оговорки

- **Загруженные фото**: на Render папка `uploads` временная — файлы сбрасываются при каждом деплое/рестарте. Для реального магазина нужен S3 (можно добавить позже).
- **Данные товаров**: в новой базе Render будут только базовые товары из сидера (~40). Остальные 370+ телевизоров добавлялись в локальную базу — их можно перенести дампом или добавить через админку.
- **Первый деплой бэкенда** собирается дольше (Maven качает зависимости), потом быстрее.
