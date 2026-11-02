#!/usr/bin/env bash
# Бэкап TV Space: дамп PostgreSQL + архив загруженных фото, ротация и выгрузка в S3.
# Запуск:  cd /путь/к/tvshop && ./backup.sh
# Перед первым запуском: chmod +x backup.sh

set -euo pipefail

# ============ Настройки (переопределяются переменными окружения) ============
KEEP_DAYS="${KEEP_DAYS:-7}"                    # сколько последних копий хранить локально
BACKUP_DIR="${BACKUP_DIR:-/var/backups/tvshop}" # куда класть бэкапы на сервере
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DB_USER="${POSTGRES_USER:-tvshop}"
DB_NAME="${POSTGRES_DB:-tvshop}"
DB_PASSWORD="${POSTGRES_PASSWORD:-tvshop}"
DATE="$(date +%Y-%m-%d_%H-%M)"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%F %T')] Начинаю бэкап…"

# 1) Дамп базы данных (сжатый gzip)
docker compose -f "$COMPOSE_FILE" exec -T -e PGPASSWORD="$DB_PASSWORD" db \
    pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/db-$DATE.sql.gz"
echo "  ✔ База сохранена: db-$DATE.sql.gz"

# 2) Загруженные фотографии (папка /app/uploads в контейнере backend)
if docker compose -f "$COMPOSE_FILE" exec -T backend \
    tar -czf - -C /app/uploads . > "$BACKUP_DIR/uploads-$DATE.tar.gz" 2>/dev/null; then
    echo "  ✔ Фото сохранены: uploads-$DATE.tar.gz"
else
    echo "  ⚠ Не удалось заархивировать фото (папка пуста или контейнер недоступен)"
    rm -f "$BACKUP_DIR/uploads-$DATE.tar.gz"
fi

# 3) Ротация: удаляем копии старше KEEP_DAYS дней
find "$BACKUP_DIR" -name "db-*.sql.gz"      -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +"$KEEP_DAYS" -delete
echo "  ✔ Ротация: храню последние $KEEP_DAYS дн."

# 4) Выгрузка в S3-облако (если заданы переменные)
if [ -n "${S3_BUCKET:-}" ] && [ -n "${S3_ENDPOINT:-}" ]; then
    if command -v aws >/dev/null 2>&1; then
        aws s3 cp "$BACKUP_DIR/db-$DATE.sql.gz" "s3://$S3_BUCKET/" --endpoint-url "$S3_ENDPOINT"
        if [ -f "$BACKUP_DIR/uploads-$DATE.tar.gz" ]; then
            aws s3 cp "$BACKUP_DIR/uploads-$DATE.tar.gz" "s3://$S3_BUCKET/" --endpoint-url "$S3_ENDPOINT"
        fi
        echo "  ✔ Выгружено в S3: $S3_BUCKET"
    else
        echo "  ⚠ aws cli не установлен — пропускаю выгрузку в S3"
    fi
fi

echo "[$(date '+%F %T')] Готово."
