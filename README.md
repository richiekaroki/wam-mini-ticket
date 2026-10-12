# wam-mini-ticket

Mini Ticket Tracker — the take-home assignment for the Mid-Level Full-Stack Developer role at Lodwar Services.

A small REST API, a PostgreSQL database, and a single-page UI for creating, listing, filtering and updating support tickets.

## Tech Stack

- **Backend:** NestJS 11, TypeScript, TypeORM, PostgreSQL (Neon), Jest + Supertest
- **Frontend:** React 19, TypeScript, Vite, hand-rolled CSS design system (no UI framework) — dark workspace theme with an amber accent, Archivo + IBM Plex Mono. See [`frontend/DESIGN.md`](frontend/DESIGN.md).

## Features

- Create a ticket (title required; description, priority and status optional)
- List tickets with status filtering and pagination
- Update a ticket's status or priority
- Counts of tickets grouped by status

## Project Structure

```
backend/src/          NestJS module, controller, service, entity and DTOs
backend/src/tickets/  Integration tests for the ticket API
frontend/src/         React components, API service layer and styles
frontend/DESIGN.md    Design system: palette, typography, layout, states, a11y
design/               Screenshots of the verified UI (desktop + mobile)
```

## Setup & Run

### Prerequisites

- Node.js 20+ (22 recommended)
- A PostgreSQL database — [Neon](https://neon.tech) free tier or local Postgres

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows: Copy-Item .env.example .env
# edit .env and set DATABASE_URL to your Postgres connection string
npm run build
npm run start:dev         # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

The frontend calls `http://localhost:3000`, so the backend must be running for the UI to work. CORS is enabled for the Vite dev server origin.

### Environment Variables

See `backend/.env.example`:

```
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=verify-full&channel_binding=require
```

`.env` is gitignored and `.env.example` contains placeholders only — no real credentials are committed.

> **Schema:** in development TypeORM runs with `synchronize: true`, so the `ticket` table is created automatically on first boot. See "Decisions & Tradeoffs" below.

## API Reference

### Create ticket

```http
POST /tickets
Content-Type: application/json

{
  "title": "Ticket title",
  "description": "Optional description",
  "priority": "medium",
  "status": "open"
}
```

**201 Created** — the ticket object.

**Errors**

- `400` — title missing, blank or longer than 255 chars; description longer than 1000 chars; unknown `status`/`priority` values; unknown fields (`forbidNonWhitelisted`).

### List tickets

```http
GET /tickets?status=open&page=1&limit=10
```

**Query parameters**

- `status` — `open` | `in_progress` | `closed` (optional)
- `page` — integer ≥ 1, default `1`
- `limit` — integer 1–100, default `10`

```json
{
  "items": [{ "id": 1, "title": "...", "status": "open", "priority": "medium", "createdAt": "..." }],
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1
}
```

**Errors:** `400` for an invalid `status`, non-numeric or out-of-range `page`/`limit`.

### Update ticket

```http
PATCH /tickets/:id
Content-Type: application/json

{ "status": "in_progress" }
```

Accepts any combination of `title`, `description`, `status`, `priority`.

**Errors:** `404` if the id does not exist, `400` if the payload is empty or invalid.

### Stats

```http
GET /tickets/stats
```

```json
{ "open": 3, "in_progress": 1, "closed": 2 }
```

## Testing

```bash
cd backend
npm test
```

The suite contains **16 integration tests** that boot the real Nest application and exercise every endpoint over HTTP against a real Postgres database (create/validation, filtering, pagination, patching and stats). Set `DATABASE_URL` in `backend/.env` (or export it) before running — the tests truncate the `ticket` table between cases, so point them at a scratch database.

There are no frontend unit tests; the UI was instead verified in a real browser against the running API (create + validation + success feedback, status updates and live summary counts, filtering with the empty state, pagination, simulated API failures with retry, keyboard tab order and focus rings, and responsive layouts at desktop and mobile widths). Screenshots of the verified UI are in `design/`; the design system itself is documented in `frontend/DESIGN.md`.

## Decisions & Tradeoffs

**NestJS instead of bare Express.** The brief listed "Node.js/Express"; I read NestJS as an acceptable Node.js choice and used it because its modules, dependency injection and class-validator DTOs map directly onto the validation rules in the spec — it removed a lot of hand-rolled middleware I would otherwise have had to write and test.

**`synchronize: true` in development.** There are no migrations, so TypeORM manages the schema from the entity at boot; this keeps "clone and run" working with zero setup, but it is not safe against production data and I would ship migrations (plus `synchronize: false`) as the very next step.

**Integration tests against a real database, not mocks.** They are slower and need a `DATABASE_URL`, but they exercise the actual SQL, the enum columns and the validation pipe end to end. For a four-hour brief that felt like better evidence than fast tests around a mocked repository.

**Swapped `@nestjs/config` for `dotenv`.** The v12 release is ESM-only, which the CommonJS Jest runner cannot import; reading `process.env` after `dotenv.config()` is one line and keeps the toolchain boring.

**Deliberately not built:** authentication, a DELETE endpoint, optimistic-concurrency handling, rate limiting, Swagger, frontend tests, and any sort of state library or router — a single `fetch` client and `useState` were enough for one page. With more time I would add migrations, a Vitest + Testing Library suite for the components, cursor-based pagination, optimistic updates for the status selector, and a CI workflow that runs lint, build and tests on every push.

**Query validation.** `page`, `limit` and `status` are validated by a DTO rather than coerced in the service, so bad input returns a `400` instead of leaking `NaN` into SQL.

## Security Notes

- Postgres connections use `sslmode=verify-full`.
- Input is validated at the boundary: DTOs use `class-validator` with `whitelist` and `forbidNonWhitelisted`.
- SQL injection is covered by TypeORM's parameterized queries.
- No authentication — every endpoint is open. That is a known MVP gap, not an oversight.

## Out of Scope

Auth, notifications, attachments, real-time updates, deployment.
