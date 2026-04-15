# Axis - ChaiCode Cinema Booking System

Seat booking app built with Express, PostgreSQL, JWT auth, and plain HTML pages.

## Tech Stack

- Node.js + Express
- PostgreSQL (pg)
- JWT access token + refresh token cookie
- Frontend pages in HTML + Tailwind CDN
- Nodemailer for email verification

## Project Structure

- `index.mjs`: server entry, DB pool, seat booking routes, static page serving
- `src/app.js`: API router mounted at `/api`
- `src/modules/auth/*`: auth routes, controller, service, middleware, DTO validation
- `frontend/pages/*`: login/register pages
- `init.sql`: creates tables and seeds seats

## Prerequisites

- Node.js 18+
- npm
- Docker Desktop (or Docker Engine + Compose)

## Installation

```bash
npm install
```

## Required Environment Variables

Create a `.env` file in the project root:

```env
# JWT
JWT_ACCESS_TOKEN_SECRET=replace_with_strong_secret
JWT_REFRESH_TOKEN_SECRET=replace_with_strong_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Email (Mailtrap or SMTP provider)
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_FROM_NAME=Axis ChaiCode Cinema
SMTP_FROM_EMAIL=no-reply@example.com

# URL used in verification email links
CLIENT_URL=http://localhost:8989
```

Notes:

- The PostgreSQL connection in `index.mjs` is currently hardcoded to local Docker defaults:
  - host: `localhost`
  - port: `5433`
  - user: `postgres`
  - password: `postgres`
  - database: `sql_class_2_db`
- `DATABASE_URL` is not currently used by the app.

## Run Locally

### 1) Start PostgreSQL

```bash
npm run db:up
```

### 2) Start app

```bash
npm start
```

Server runs at:

- http://localhost:8989

## NPM Scripts

- `npm start`: start server with `node index.mjs`
- `npm run dev`: start with `nodemon index.mjs`
- `npm run db:up`: start postgres container
- `npm run db:down`: stop container and remove volume

## Routes Overview

### UI and Seat Routes

- `GET /`: main page (`index.html`)
- `GET /login.html`: login page
- `GET /register.html`: register page
- `GET /seats`: protected, requires `Authorization: Bearer <accessToken>`
- `PUT /:id/:name`: book a seat

### API Routes

Base prefix: `/api`

- `GET /health`

Auth base prefix: `/api/auth`

- `POST /register`
- `POST /login`
- `POST /refresh-token`
- `POST /logout` (protected)
- `GET /verify-email/:token`
- `GET /health` (protected)

## Auth Flow

1. Register via `POST /api/auth/register`.
2. Verify email using the link sent by email (`/api/auth/verify-email/:token`).
3. Login via `POST /api/auth/login`.
4. Response includes `accessToken` and sets `refreshToken` cookie.
5. Use `Authorization: Bearer <accessToken>` for protected routes.
6. Refresh access token with `POST /api/auth/refresh-token`.
7. Logout with `POST /api/auth/logout`.

## Quick API Test

### Login

```http
POST http://localhost:8989/api/auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "yourPassword"
}
```

### Refresh Token

```http
POST http://localhost:8989/api/auth/refresh-token
```

Requires `refreshToken` cookie from login response.

### Logout

```http
POST http://localhost:8989/api/auth/logout
Authorization: Bearer <accessToken>
```

## Database Notes

- `init.sql` creates `seats` and `users` tables.
- `init.sql` seeds 40 seats only if not already present.
- SQL in `insert.sql` is for manual experimentation only.

## Useful Commands

Check seat count:

```bash
docker compose exec -T db psql -U postgres -d sql_class_2_db -c "select count(*) from seats;"
```

Reset DB and re-run init script:

```bash
docker compose down -v
docker compose up -d db
```

View container logs:

```bash
docker compose logs --tail=120 db
docker compose logs --tail=120 app
```
