# Axis - ChaiCode Cinema Booking System

Seat booking application built with Express, PostgreSQL, and simple frontend pages.

## Stack

- Node.js + Express
- PostgreSQL via pg
- Auth with JWT access token + refresh token cookie
- Frontend pages in plain HTML with Tailwind CDN

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Docker Desktop (or Docker Engine + Compose)

### Install

```bash
npm install
```

### Start database

```bash
npm run db:up
```

### Start app

```bash
npm start
```

App runs on:

- http://localhost:8989

## NPM Scripts

- npm start: start server with node index.mjs
- npm run dev: start with nodemon
- npm run db:up: start postgres container
- npm run db:down: stop and remove volumes

## Database Notes

The app now supports both:

- DATABASE_URL (recommended for Supabase/production)
- PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE (local fallback)

Local setup still works with Docker on localhost:5433.

init.sql is run only on first initialization of the Postgres volume.

## Routes Overview

### Page and Seat Routes

- GET /
- GET /seats
- PUT /:id/:name

### Auth API Routes

Base prefix: /api/auth

- POST /register
- POST /login
- POST /refresh-token
- POST /logout
- GET /health

### Other API Base

- /api mounts src/app.js routes

## Auth Flow

1. Login with email and password at POST /api/auth/login.
2. Response includes accessToken, and server sets refreshToken cookie.
3. Store accessToken on frontend and send it as Authorization header for protected calls.
4. Refresh access token using POST /api/auth/refresh-token (reads refreshToken from cookie).
5. Logout using POST /api/auth/logout.

## Postman Quick Test

### Login

POST http://localhost:8989/api/auth/login

Body JSON:

```json
{
	"email": "you@example.com",
	"password": "yourPassword"
}
```

### Refresh token

POST http://localhost:8989/api/auth/refresh-token

- No body required
- Requires refreshToken cookie from login response

### Logout

POST http://localhost:8989/api/auth/logout

- Requires Authorization: Bearer <accessToken>


## Useful Commands

Check DB rows:

```bash
docker compose exec -T db psql -U postgres -d sql_class_2_db -c "select count(*) from seats;"
```

Re-seed DB (delete volume):

```bash
docker compose down -v
docker compose up -d db
```

View logs:

```bash
docker compose logs --tail=120 db
docker compose logs --tail=120 app
```
