# TV Space — интернет-магазин телевизоров, аудио и проекторов

Полноценный фул-стек проект:

- **Бэкенд** — Java 21, Spring Boot 3.3, Spring Data JPA, Spring Security (JWT), PostgreSQL.
- **Фронтенд** — React 18 + Vite, витрина + корзина + оформление заказа + админ-панель.
- **База данных** — PostgreSQL (через Docker), демо-данные загружаются автоматически.
- **Оплата** — демо-режим (без реального платёжного провайдера).

## Каталог

Основные разделы: **Телевизоры** (Samsung, LG, Hisense, TCL), **Аудио системы**
(LG, Samsung, Hisense), **Проекторы** (Hisense). Плюс сопутствующие товары:
кронштейны, кабели, пульты и аксессуары.

Название, город, почту и телефон можно поменять в одном месте —
`frontend/src/config.js`.

## Структура

```
AIGHS/
├── backend/            # Spring Boot (REST API)
├── frontend/           # React + Vite
├── docker-compose.yml  # PostgreSQL
├── .env                # переменные окружения БД
├── scripts/            # вспомогательные скрипты
├── .tools/             # переносимые JDK 21 и Maven 3.9.9 (скачаны автоматически)
├── run-backend.ps1
├── run-frontend.ps1
└── start-db.ps1
```

## Что уже подготовлено (переносимо, ставить ничего не нужно)

- Java JDK 21 (Temurin) — в `.tools/jdk`
- Maven 3.9.9 — в `.tools/maven`
- Node.js + pnpm — предоставляются средой DSH

## Запуск

### 1. База данных (PostgreSQL)

Запусти **Docker Desktop**, затем:

```powershell
.\start-db.ps1
```

Либо вручную: `docker compose up -d db`.
Параметры подключения — в файле `.env` (по умолчанию: БД `tvshop`, пользователь/пароль `tvshop`, порт `5432`).

### 2. Бэкенд

```powershell
.\run-backend.ps1
```

Сервер поднимется на **http://localhost:8080**. При первом старте в БД автоматически
создаются таблицы и загружаются демо-данные (категории, ~20 товаров, пользователи).

### 3. Фронтенд

В отдельном терминале:

```powershell
.\run-frontend.ps1
```

Сайт откроется на **http://localhost:5173** (Vite проксирует `/api` на бэкенд).

## Демо-доступы

| Роль | Email | Пароль |
|---|---|---|
| Администратор | `admin@tvspace.ru` | `admin123` |
| Покупатель | `customer@tvspace.ru` | `customer123` |

Админ-панель: **http://localhost:5173/admin** (дашборд, товары, заказы, категории).

## Основные эндпоинты API

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход (возвращает JWT) |
| GET | `/api/products` | Список товаров (фильтры: `category`, `q`, `sort`, `page`, `size`) |
| GET | `/api/products/{slug}` | Товар |
| GET | `/api/categories` | Категории |
| GET/POST/PATCH/DELETE | `/api/cart` | Корзина (JWT) |
| POST/GET | `/api/orders` | Оформление и список заказов (JWT) |
| GET/POST/PUT/DELETE | `/api/admin/products` | Управление товарами (ADMIN) |
| GET/PATCH | `/api/admin/orders` | Заказы и смена статуса (ADMIN) |
| GET | `/api/admin/stats` | Статистика для дашборда (ADMIN) |

## Быстрая проверка бэкенда без PostgreSQL

Для локального smoke-теста бэкенд можно запустить на in-memory H2:

```powershell
. .\scripts\env.ps1
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=smoke
```

## Примечания

- `.mvn/maven.config` направляет локальный репозиторий Maven в `.m2` внутри проекта.
- Первый запуск бэкенда скачивает зависимости Maven (нужен интернет).
- `pnpm install` во фронтенде при первом запуске выполняет проверку lockfile (нужен интернет).
