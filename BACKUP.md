# Бэкапы TV Space

Автоматический бэкап базы данных и загруженных фото с ротацией и выгрузкой в S3-облако.

## Что бэкапится

- **PostgreSQL** — товары, заказы, пользователи, категории, настройки «Сайта», фильтры.
- **Папка `uploads`** — фотографии, загруженные через админку.

## 1. Подготовка на сервере

```bash
# скопируй backup.sh в папку проекта (если ещё нет)
chmod +x backup.sh

# настройки
cp .backup.env.example .backup.env
nano .backup.env
```

Заполни в `.backup.env`:
- `S3_BUCKET`, `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — если нужна выгрузка в облако.
- Если S3 не нужен — просто оставь эти строки пустыми/закомментированными.

## 2. Установка aws cli (для S3)

```bash
sudo apt install -y awscli
```
Или через pip: `pip install awscli`.

Для Yandex Object Storage `S3_ENDPOINT=https://storage.yandexcloud.net`, для Selectel — `https://s3.storage.selcdn.ru`, для Timeweb — по их доке.

## 3. Автозапуск раз в сутки (cron)

```bash
crontab -e
```
Добавь строку (бэкап ежедневно в 3:00 ночи):
```
0 3 * * * cd /путь/к/tvshop && set -a && . ./.backup.env && set +a && ./backup.sh >> /var/log/tvshop-backup.log 2>&1
```

> `set -a && . ./.backup.env && set +a` — экспортирует переменные из файла в окружение скрипта.

## 4. Ротация в облаке (S3 Lifecycle)

Скрипт сам чистит **локальные** копии (последние 7 дней). Чтобы облако тоже не разрасталось, в настройках бакета включи **Lifecycle-правило**: «удалять объекты старше 7 дней».

- Yandex Object Storage: Бакет → «Жизненные циклы» → правило `expiration` 7 дней.
- Selectel/Timeweb — аналогично.

## 5. Восстановление

Если сервер упал — подними новый, разверни Docker, затем:

```bash
# База
gunzip -c backup-2026-11-02.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T -e PGPASSWORD=ПАРОЛЬ db psql -U tvshop tvshop

# Фото
docker compose -f docker-compose.prod.yml exec -T backend tar -xzf - -C /app/uploads < uploads-2026-11-02.tar.gz
```

---

## Проверка бэкапа вручную

```bash
cd /путь/к/tvshop
set -a && . ./.backup.env && set +a
./backup.sh
ls -lh /var/backups/tvshop/
```
