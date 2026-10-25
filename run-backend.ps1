# Запуск бэкенда (Spring Boot + PostgreSQL).
# Требования: PostgreSQL уже поднят (см. start-db.ps1).
. "$PSScriptRoot\scripts\env.ps1"
Set-Location "$PSScriptRoot\backend"
mvn spring-boot:run
