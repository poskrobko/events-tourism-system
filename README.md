# Library Preferences System

Веб-приложение для управления библиотекой и рекомендаций книг на основе читательских предпочтений.

## Документация

- [Архитектура и техническое решение](docs/architecture.md)
- [Use Cases (15+)](docs/use-cases.md)
- [API v1 (REST)](docs/api-v1.md)
- [Схема данных (PostgreSQL)](docs/data-model.md)
- [План реализации и качество](docs/implementation-plan.md)

## Стек

- **Backend:** Java 21, Spring Boot 3.2+, Spring Web, Spring Security, Spring Data JPA/JDBC, Flyway, PostgreSQL, Redis, OAuth2 Client
- **Frontend:** React 18, TypeScript, Vite, Redux Toolkit, React Router, Axios, Tailwind CSS
- **DevOps:** Docker, Docker Compose, GitHub Actions

## Быстрый старт

```bash
# 1) поднять инфраструктуру

docker compose up -d postgres redis
# если 5432 занят: POSTGRES_PORT=5433 docker compose up -d postgres redis

# 2) backend
cd backend && mvn spring-boot:run

# 3) frontend
cd frontend && npm install && npm run dev
```

> В репозитории доступны backend (`backend/`), frontend (`frontend/`), docker-compose для postgres/redis и CI workflow (`.github/workflows/ci.yml`).

## Backend status

Backend реализован в директории `backend/` (Spring Boot 3). См. `backend/README.md`.

## Frontend status

Frontend реализован в директории `frontend/` (React 18 + TypeScript + Vite + Redux Toolkit + React Router). См. `frontend/README.md`.
