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
- Java 21
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
