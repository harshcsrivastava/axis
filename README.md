# Booking System (Express + PostgreSQL)

Simple seat-booking API using Express and PostgreSQL.

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (or Docker Engine with Compose)
- `curl` (optional, for API checks)

## Project Files

- `index.mjs`: Express server + PostgreSQL queries
- `init.sql`: creates and seeds the `seats` table
- `docker-compose.yml`: Postgres + app containers

## Important Connection Note

Current app code uses this DB connection:

- host: `localhost`
- port: `5433`
- user: `postgres`
- password: `postgres`
- database: `sql_class_2_db`

Because of that, the safest setup is:

- Run **Postgres in Docker**
- Run **Node app locally**

## Setup (Recommended)

### 1. Install dependencies

```bash
npm install
```

### 2. Start only database container

```bash
docker compose up -d db
```

### 3. Verify DB is healthy

```bash
docker compose ps
```

You should see `booking-db` as `healthy`.

### 4. Run the app locally

```bash
npm start
```

Server starts on: `http://localhost:8989`

## Database Initialization

`init.sql` is auto-run by Postgres only on first DB initialization (when the volume is empty).

It does:

- create table `seats`
- insert 20 default seats if table is empty

If you already have DB volume data, `init.sql` will not run again automatically.

## API Endpoints

### Health/Home

```http
GET /
```

Returns the HTML page.

### Get all seats

```http
GET /seats
```

### Book a seat

```http
PUT /:id/:name
```

Example:

```bash
curl -X PUT http://localhost:8989/5/Harsh
```

## Quick Checks

### Check rows directly in DB

```bash
docker compose exec -T db psql -U postgres -d sql_class_2_db -c "select count(*) from seats;"
```

### Check API response

```bash
curl http://localhost:8989/seats
```

## Troubleshooting

### "DB has no entries"

1. Check DB rows with `psql` command above.
2. If rows exist but API fails, ensure app is running locally (`npm start`) and not as Docker `app` service.
3. If you need a clean DB re-seed:

```bash
docker compose down -v
docker compose up -d db
```

### Port already in use

- DB host port: `5433`
- App port: `8989`

Stop conflicting services, then restart.

## Useful Docker Commands

Stop everything:

```bash
docker compose down
```

Stop and delete DB data volume:

```bash
docker compose down -v
```

View logs:

```bash
docker compose logs --tail=120 db
docker compose logs --tail=120 app
```