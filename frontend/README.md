# Frontend (HTML + CSS + Vanilla JS)

Frontend теперь полностью реализован без фреймворков JavaScript: только **HTML + CSS + Vanilla JS** с использованием **Bootstrap 5** для сетки и базовых UI-компонентов.

## Страницы

- `login.html` — вход
- `register.html` — регистрация
- `forgot-password.html` — восстановление пароля
- `events.html` — список событий (карточки)
- `event-details.html` — детали события
- `ticket.html` — покупка билета
- `profile.html` — профиль
- `admin.html` — админ-панель

## Запуск

```bash
cd frontend
python3 -m http.server 8081
```

Открыть: `http://localhost:8081/events.html`

## Структура

- `styles.css` — общие стили и цветовая система (`#FF9760`, `#FFD150`, `#458B73`)
- `app.js` — общая логика UX (валидация форм, feedback, подсчёт итоговой суммы)
- `*.html` — отдельные страницы интерфейса

## Важно про структуру

Сейчас используется **только одна** директория frontend — `frontend/`.
Папка `frontend/vanilla` больше не используется и была удалена.
Все HTML-файлы находятся прямо в `frontend/`.
