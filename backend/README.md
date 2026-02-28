# Backend (Spring Boot)

Реализован базовый Backend для `Library Preferences System` по API-контракту из `docs/api-v1.md`.

## Что реализовано

- REST API v1 (`/api/v1/...`) для:
  - auth: register/login/refresh/logout
  - books: CRUD + фильтрация и пагинация
  - loans: borrow/return/extend + список займов пользователя
  - ratings/reviews
  - preferences/recommendations
  - reservations (create/cancel/list) + availability notifications
  - admin users + role patch
- JPA-сущности и репозитории для основных таблиц.
- Flyway-миграции (`src/main/resources/db/migration`).
- JWT access token (Bearer) + refresh token (в БД).
- Конфигурация H2 (in-memory) для быстрого локального запуска.
- Подготовка к PostgreSQL/Redis/OAuth2 Client через зависимости и настройки.

## Запуск

```bash
# из корня репозитория поднять инфраструктуру
# docker compose up -d postgres redis

cd backend
mvn spring-boot:run
```

По умолчанию backend стартует на H2. Чтобы работать с PostgreSQL, передайте переменные окружения:

```bash
DB_URL=jdbc:postgresql://localhost:5432/library \
DB_DRIVER=org.postgresql.Driver \
DB_USER=library_user \
DB_PASSWORD=library_pass \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
JWT_SECRET=<base64-or-plain-secret-at-least-32-bytes> \
JWT_ACCESS_EXPIRATION_SECONDS=3600 \
mvn spring-boot:run
```


## Подключение к PostgreSQL через pgAdmin

1. Запусти инфраструктуру:

```bash
docker compose up -d postgres redis
```

2. Открой pgAdmin и создай новое подключение (`Register -> Server`).
3. Вкладка **General**: укажи любое имя, например `library-local`.
4. Вкладка **Connection**:
   - **Host name/address**: `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `library`
   - **Username**: `library_user`
   - **Password**: `library_pass`
5. Нажми **Save**.

Параметры совпадают с `docker-compose.yml`.

### Если при `docker compose up` ошибка `address already in use` на `5432`

Это значит, что порт `5432` уже занят другим Postgres на хосте.

Вариант 1 (рекомендуется): запустить контейнер на другом порту, например `5433`:

```bash
POSTGRES_PORT=5433 docker compose up -d postgres redis
```

Тогда подключение будет:
- pgAdmin: host `localhost`, port `5433`
- Backend JDBC URL: `jdbc:postgresql://localhost:5433/library`

Пример запуска backend:

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:5433/library DB_DRIVER=org.postgresql.Driver DB_USER=library_user DB_PASSWORD=library_pass REDIS_HOST=localhost REDIS_PORT=6379 mvn spring-boot:run
```

Вариант 2: освободить порт `5432` (остановить локальный Postgres/контейнер, который его использует).

### Если в pgAdmin ошибка `password authentication failed for user "library_user"`

Частая причина: контейнер `postgres` уже инициализирован со **старыми** credentials в Docker volume.
`POSTGRES_USER/POSTGRES_PASSWORD` из `docker-compose.yml` применяются только при первом создании data volume.

Проверь и исправь по шагам:

1. Останови контейнеры:

```bash
docker compose down
```

2. Удали volume с данными Postgres (это удалит локальные данные БД):

```bash
docker volume rm lib-preferences-system_postgres_data
```

Если имя volume отличается, посмотри его так:

```bash
docker volume ls | grep postgres_data
```

3. Подними Postgres заново:

```bash
docker compose up -d postgres
```

4. Проверь логин/пароль через psql внутри контейнера:

```bash
docker exec -it library-postgres psql -U library_user -d library -c "select current_user, current_database();"
```

5. Подключись в pgAdmin заново с параметрами:
   - host: `localhost`
   - port: `5432`
   - db: `library`
   - user: `library_user`
   - password: `library_pass`

Альтернатива без удаления volume: использовать те credentials, с которыми volume был инициализирован изначально.

### Ошибка `Unsupported Database: PostgreSQL 16.x`

Если при старте backend видишь ошибку Flyway вида:

```text
Unsupported Database: PostgreSQL 16.x
```

это означает, что для Flyway 10 нужен отдельный модуль поддержки PostgreSQL.
В этом проекте он уже добавлен в `pom.xml` как `org.flywaydb:flyway-database-postgresql`.

Что сделать локально:

1. Забери последние изменения репозитория.
2. Пересобери backend, чтобы подтянулся новый dependency:

```bash
cd backend
mvn -U clean package -DskipTests
```

3. Запусти backend снова с `DB_URL/DB_USER/DB_PASSWORD` для Postgres.

## Если миграции "не запускаются"

Проверь 3 частые причины:

1. **Backend подключен не к PostgreSQL, а к H2 (по умолчанию).**  
   Без `DB_URL/DB_DRIVER/DB_USER/DB_PASSWORD` приложение стартует с in-memory H2.
2. **Схема уже была создана вручную раньше.**  
   В проекте включен `baseline-on-migrate`, поэтому Flyway может создать baseline и продолжить версионирование.
3. **Нужно прогнать миграции вручную.**

### Принудительный запуск миграций (Maven Flyway plugin)

```bash
cd backend
mvn \
  -Dflyway.url=jdbc:postgresql://localhost:${POSTGRES_PORT:-5432}/library \
  -Dflyway.user=library_user \
  -Dflyway.password=library_pass \
  flyway:migrate
```

### Как проверить, что миграции применились

```sql
select installed_rank, version, description, success
from flyway_schema_history
order by installed_rank;
```

Если в `flyway_schema_history` есть записи `V1` и `V2`, миграции сработали.

## Seed-данные

В проект добавлен Flyway seed-скрипт `V2__seed_meaningful_data.sql` с осмысленными демо-данными:
- пользователи (reader/librarian/admin),
- роли,
- книги,
- профили рекомендаций,
- оценки и отзывы,
- активный/завершённый займ,
- бронирования (`WAITING`, `NOTIFIED`).

### Как запустить seed

Seed применяется автоматически при старте backend (Flyway):

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:${POSTGRES_PORT:-5432}/library DB_DRIVER=org.postgresql.Driver DB_USER=library_user DB_PASSWORD=library_pass REDIS_HOST=localhost REDIS_PORT=6379 mvn spring-boot:run
```

После успешного старта в pgAdmin можно выполнить, например:

```sql
select count(*) from users;
select count(*) from books;
select count(*) from loans;
select count(*) from reservations;
```

## Тесты

```bash
cd backend
mvn test
```

## Maven 403 / проблемы с доступом к репозиторию

Если `mvn test` падает с `403 Forbidden` при загрузке из Maven Central, значит в окружении нет прямого выхода в интернет и нужен корпоративный mirror (Nexus/Artifactory).

1. Открой `backend/.mvn/settings.xml`.
2. Замени `https://REPLACE-WITH-YOUR-NEXUS-OR-ARTIFACTORY/repository/maven-public/` на рабочий URL mirror.
3. При необходимости раскомментируй `<server>` и передай креды через `MAVEN_REPO_USER`/`MAVEN_REPO_PASS`.
4. Запускай Maven так:

```bash
cd backend
mvn -s .mvn/settings.xml test
```
