# Event Tourism Backend (Spring Boot)

Backend полностью переработан под **Систему управления event-туризмом** с модулем продажи билетов и управлением программой мероприятий.

## Реализованный функционал

### Для пользователя
- Регистрация и авторизация (JWT)
- Просмотр списка мероприятий
- Фильтрация мероприятий по дате, городу, минимальной/максимальной цене
- Просмотр деталей мероприятия
- Просмотр программы мероприятия
- Покупка билета
- Просмотр своих билетов
- Просмотр истории заказов

### Для администратора
- CRUD мероприятий
- Управление программой мероприятия (добавление/изменение/удаление пунктов расписания)
- Управление билетами (цена, общее количество)
- Просмотр всех заказов пользователей

### Дополнительно
- Локация события: city + venue + latitude/longitude + mapUrl
- Интеграция календаря: для каждого события генерируется URL добавления в Google Calendar

## Технологии
- Java 17+ (рекомендуется 17 или 21)
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- Flyway
- H2 (по умолчанию) / PostgreSQL

## Быстрый запуск

### 1) Запуск backend
```bash
cd backend
./mvnw spring-boot:run
```
Если `mvnw` отсутствует, можно использовать системный Maven:
```bash
mvn spring-boot:run
```

Приложение стартует на `http://localhost:8080`.

### 2) Тестовый запуск
```bash
cd backend
mvn test
```

## Переменные окружения
- `DB_URL` (default: `jdbc:h2:mem:librarydb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`)
- `DB_DRIVER` (default: `org.h2.Driver`)
- `DB_USER` (default: `sa`)
- `DB_PASSWORD` (default: пусто)
- `JWT_SECRET` (default: dev secret)
- `JWT_ACCESS_EXPIRATION_SECONDS` (default: `3600`)
- `APP_ADMIN_EMAIL` (default: `admin@event.local`)
- `APP_ADMIN_PASSWORD` (default: `admin123`)

При старте автоматически создается администратор, если пользователя с таким email еще нет.

## Основные API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Публичные события
- `GET /api/events?dateFrom=&dateTo=&city=&minPrice=&maxPrice=`
- `GET /api/events/{eventId}`
- `GET /api/events/{eventId}/program`
- `GET /api/events/{eventId}/tickets`

### User (требуется JWT)
- `POST /api/user/tickets/purchase`
- `GET /api/user/tickets`
- `GET /api/user/orders`

### Admin (JWT с ролью ADMIN)
- `POST /api/admin/events`
- `PUT /api/admin/events/{eventId}`
- `DELETE /api/admin/events/{eventId}`
- `POST /api/admin/events/{eventId}/program`
- `PUT /api/admin/program/{itemId}`
- `DELETE /api/admin/program/{itemId}`
- `POST /api/admin/events/{eventId}/tickets`
- `PUT /api/admin/tickets/{ticketTypeId}`
- `DELETE /api/admin/tickets/{ticketTypeId}`
- `GET /api/admin/orders`

## Примечание
Это старт backend-части с чистой доменной моделью под event-туризм. Следующий шаг — адаптация frontend под новые endpoints и сценарии.

## Troubleshooting (Windows)

Если видите ошибку:

`UnsupportedClassVersionError ... class file version 65.0 ... recognizes up to 61.0`

это значит, что часть классов уже была собрана под Java 21, а запуск идет на Java 17.

Что сделать:
1. Очистить старые классы:
   ```bash
   mvn clean
   ```
2. Проверить версии:
   ```bash
   java -version
   mvn -version
   ```
   В `mvn -version` должна быть Java 17 или 21.
3. Запустить заново:
   ```bash
   mvn clean spring-boot:run
   ```

Если запускаете из IDE, сделайте **Rebuild Project** и убедитесь, что Project SDK = 17 (или 21).

Если видите ошибку:

`NoClassDefFoundError: org/springframework/boot/SpringApplication`

это обычно проблема локального Maven-кэша/неполной загрузки зависимостей, а не кода приложения.

Починка:
1. Удалите битые артефакты Spring Boot из локального кэша:
   ```bash
   rmdir /S /Q "%USERPROFILE%\\.m2\\repository\\org\\springframework\\boot"
   ```
2. Принудительно перекачайте зависимости:
   ```bash
   mvn -U clean dependency:resolve
   ```
3. Проверьте, что spring-boot реально в classpath:
   ```bash
   mvn -q dependency:tree -Dincludes=org.springframework.boot:spring-boot
   ```
4. Запустите снова:
   ```bash
   mvn clean spring-boot:run
   ```

Если у вас корпоративный прокси/зеркало Nexus, проверьте `settings.xml` (mirror/proxy), потому что частично скачанные jar дают именно такие ошибки.

## Запуск через `java -jar`

Да, можно и часто даже стабильнее запускать именно так (без `spring-boot:run`), потому что jar уже содержит полный classpath приложения.

Команды:
```bash
cd backend
mvn clean package -DskipTests
java -jar target/events-tourism-backend-0.0.1-SNAPSHOT.jar
```

Важно:
- имя jar берется из `artifactId` + `version` в `pom.xml`;
- для этого проекта корректное имя: `events-tourism-backend-0.0.1-SNAPSHOT.jar`.

Если хотите, можно запускать и через Maven:
```bash
mvn clean spring-boot:run
```
Но при проблемах с classpath/локальным кэшем вариант `java -jar` обычно надежнее.
