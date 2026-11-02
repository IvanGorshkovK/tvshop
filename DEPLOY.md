# Деплой TV Space на российский VPS (Docker)

Вся система (PostgreSQL + бэкенд + фронтенд) разворачивается на одной виртуалке через Docker Compose.

## Схема

| Компонент | Как работает |
|---|---|
| Nginx (frontend) | Раздаёт сайт + проксирует `/api` на бэкенд, порт 80/443 |
| Backend (Spring Boot) | Внутри сети Docker, порт 8080 (наружу не торчит) |
| PostgreSQL | Внутри сети Docker, данные в volume `pgdata` |

---

## Шаг 0. Что нужно купить

1. **VPS** (рекомендую для РФ): **Timeweb**, **Selectel**, **Beget**, **reg.ru VPS**, **VK Cloud** или **Yandex Cloud**.
   - Минимум: 2 vCPU, 2 ГБ RAM, Ubuntu 22.04/24.04.
2. **Домен** `.ru` (регистратор: REG.RU, Timeweb, Beget).

---

## Шаг 1. Подготовка сервера (по SSH)

```bash
# Обнови пакеты
sudo apt update && sudo apt upgrade -y

# Установи Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# перезайди в SSH, чтобы права применились
```

Проверка: `docker --version && docker compose version`.

---

## Шаг 2. Загрузить проект на сервер

Способ А — через Git:
```bash
git clone https://github.com/ТВОЙ_ЛОГИН/tvshop.git
cd tvshop
```

Способ Б — скопировать папку проекта с компьютера:
```powershell
scp -r C:\Users\Иван\Desktop\AIGHS user@СЕРВЕР_IP:/home/user/tvshop
```

---

## Шаг 3. Настроить переменные (.env)

```bash
cp .env.example .env
nano .env
```

Обязательно заполни:
- `POSTGRES_PASSWORD` — сильный пароль.
- `JWT_SECRET` — длинная случайная строка: `openssl rand -hex 32`.
- `CORS_ORIGINS` — твой домен (например `https://tvspace.ru`). Пока домена нет — поставь `*` временно.
- `SITE_URL` — домен (для sitemap/robots). Пока нет — оставь пустым.

---

## Шаг 4. Запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Первый запуск собирает образы (Maven качает зависимости — 2–5 минут). Далее — быстрее.

Проверка:
```bash
docker compose -f docker-compose.prod.yml ps        # все сервисы Up
curl http://localhost/actuator/health                # {"status":"UP"}
```

Сайт уже доступен по IP сервера: `http://СЕРВЕР_IP`.

---

## Шаг 5. Привязать домен (DNS)

У регистратора домена создай **A-запись**:
```
@   A   СЕРВЕР_IP
www A   СЕРВЕР_IP
```
Подожди до часа, пока DNS обновится.

---

## Шаг 6. HTTPS (Let's Encrypt)

Самый простой способ — Caddy вместо Nginx, либо certbot. Быстрый вариант через certbot+nginx:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tvspace.ru -d www.tvspace.ru
```
Сертификат продлевается автоматически.

> После этого поменяй `CORS_ORIGINS` и `SITE_URL` в `.env` на `https://tvspace.ru` и перезапусти: `docker compose -f docker-compose.prod.yml up -d`.

---

## Шаг 7. Юридическое (152-ФЗ)

Раз хранишь телефоны/email/адреса покупателей — это персональные данные:
1. Политика конфиденциальности (страница `/privacy`) — уже есть.
2. Уведомление Роскомнадзора об обработке ПДн (через сайт РКН).
3. Если продаёшь физлицам — нужен статус ИП/ООО + онлайн-касса (54-ФЗ).

---

## Полезные команды

```bash
# Пересобрать после обновления кода
docker compose -f docker-compose.prod.yml up -d --build

# Логи
docker compose -f docker-compose.prod.yml logs -f backend

# Остановить
docker compose -f docker-compose.prod.yml down

# Бэкап базы
docker compose -f docker-compose.prod.yml exec db pg_dump -U tvshop tvshop > backup.sql
```

---

## Оговорки

- **Загруженные фото** хранятся в volume `uploads` — не теряются при рестарте.
- **Данные**: в новой базе будут только товары из сидера (телевизоры-приставки + базовые). Полную локальную базу переноси дампом: `pg_dump` на локали → `psql` на сервере.
- **AI-генерация** работает только если задан `DEEPSEEK_API_KEY`.
