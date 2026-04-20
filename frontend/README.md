# Frontend (React + TypeScript + Vite)

Обновлённый SPA интерфейс для `Library Preferences System`.

## Запуск

```bash
cd frontend
npm install
npm run dev
```

Dev server поднимается на `http://localhost:5173` и проксирует `/api` на `http://localhost:8080`.

## Что теперь покрыто из use-cases

- Стартовая страница — логин (`/login`), логин не находится в основном меню.
- Гость может просматривать каталог, но при попытке взять книгу отправляется на страницу логина.
- В каталоге рекомендованные книги для текущего пользователя помечаются бейджем `рекомендация`.
- Профиль позволяет редактировать имя/email и просматривать свои займы.
- Возврат книги доступен из профиля кнопкой `Return` для `ACTIVE` займов.
- Поле просмотра по `userId` доступно только администратору.
- Фильтры жанров/авторов и предпочтения реализованы через `select` c подгрузкой опций из БД (`/books/meta`).
- UI учитывает роль пользователя (`GUEST` / `USER` / `ADMIN`).

## Vanilla JS UI prototype (events)

Добавлен отдельный многостраничный прототип на **HTML + CSS + Vanilla JS + Bootstrap 5**:

- `vanilla/login.html`
- `vanilla/register.html`
- `vanilla/forgot-password.html`
- `vanilla/events.html`
- `vanilla/event-details.html`
- `vanilla/ticket.html`
- `vanilla/profile.html`
- `vanilla/admin.html`

Запуск локально без сборки:

```bash
cd frontend/vanilla
python3 -m http.server 8081
```

Открыть `http://localhost:8081/events.html`.
