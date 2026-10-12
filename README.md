# Wam Mini Ticket Tracker

A small full-stack app for creating, listing and updating support tickets, built for the Lodwar Services take-home assignment.

- **Backend:** Node.js, TypeScript, NestJS 11, TypeORM, PostgreSQL
- **Frontend:** React 19, TypeScript, Vite
- **Tests:** Jest and Supertest (API integration tests)

## Features

- Create a ticket (title required; description, status and priority optional)
- List tickets with a status filter and pagination
- Change a ticket's status (or priority) with `PATCH`
- Ticket counts grouped by status
- Single-page UI: summary counts, create form, ticket list with a status dropdown, filter and pagination

## Project structure

```text
backend/src/
├── main.ts                      # app bootstrap, global ValidationPipe, CORS
├── app.module.ts
└── tickets/
    ├── dto/
    │   ├── create-ticket.dto.ts
    │   └── update-ticket.dto.ts
    ├── ticket.entity.ts         # table definition
    ├── tickets.controller.ts    # routes
    ├── tickets.service.ts       # business logic, pagination, stats
    ├── tickets.module.ts
    └── tickets.controller.spec.ts   # integration tests

frontend/src/
├── main.tsx
├── App.tsx
├── style.css
├── components/                  # CreateTicket, TicketList, TicketStats
└── services/                    # ticket.service.ts (API calls), ticket-types.ts
```

## Data model

| Field | Type | Rules |
| ------- | ------ | ------- |
| `id` | integer | primary key |
| `title` | string | required, must not be blank |
| `description` | string | optional |
| `status` | enum | `open`, `in_progress`, `closed` (default `open`) |
| `priority` | enum | `low`, `medium`, `high` (default `medium`) |
| `createdAt` | timestamp | set on creation |

## API

| Method | Endpoint | Purpose |
| -------- | ---------- | --------- |
| `POST` | `/tickets` | Create a ticket (`201`) |
| `GET` | `/tickets?status=&page=&limit=` | List tickets, filtered and paginated |
| `PATCH` | `/tickets/:id` | Update status and/or priority |
| `GET` | `/tickets/stats` | Count of tickets per status |

- `GET /tickets` defaults to `page=1` and `limit=10` (maximum 100) and returns `{ items, page, limit, total, totalPages }`.
- `GET /tickets/stats` returns `{ "open": 0, "in_progress": 0, "closed": 0 }` with zero counts included.
- Errors: `400` for invalid bodies (blank or missing title, invalid status or priority, unknown fields, empty `PATCH` body) and `404` when the ticket to update does not exist.

## Prerequisites

- Node.js 22 (developed on 22.16) and npm
- A PostgreSQL database

## Setup and run

From the repository root:

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env      # then edit DATABASE_URL
npm run start:dev         # http://localhost:3000
```

In a second terminal:

```bash
# 2. Frontend
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Open <http://localhost:5173>. The key workflow: create a ticket, see it in the list, change its status, and watch the list and summary counts refresh.

### Configuration

`backend/.env.example` contains placeholders only; never commit a real `.env`.

```dotenv
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/mini_ticket_tracker
```

The tickets table is created by TypeORM from `ticket.entity.ts`. CORS allows the Vite dev server origin `http://localhost:5173`.

## Running tests

```bash
cd backend
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/mini_ticket_tracker_test npm test
```

**Important:** the tests start the real app and call `repo.clear()` before every test, which empties the `tickets` table. Always point `DATABASE_URL` at a separate, throwaway database, never at your development data. A value set in the shell takes priority over the one in `.env`.

The suite covers:

1. Creating a valid ticket (`201`, defaults applied) and rejecting a blank title, a missing title, and invalid status or priority values (`400`)
2. Listing with a status filter and with pagination
3. `PATCH` for status and priority, a missing ticket (`404`) and an empty body (`400`)
4. Stats with no tickets and with tickets in each status

Frontend type check: `cd frontend && npm run lint` (runs `tsc --noEmit`).

## Decisions & Tradeoffs

I used NestJS with TypeORM and PostgreSQL and kept all ticket code in one feature module, because the assignment has a single entity and four endpoints. Request validation lives in DTOs behind a global `ValidationPipe` that strips and rejects unknown fields, and the service trims the title and rejects empty `PATCH` bodies. Pagination defaults to page 1 with 10 items and is capped at 100, and the stats endpoint is one grouped query that fills in zero counts for missing statuses. The integration tests go through Supertest against a real Postgres database rather than mocks, which is slower but exercises validation, persistence and queries together; because they empty the table, they have to run against a dedicated database. The frontend is a single React page using plain `useState` and `useEffect`, with no router, state library or UI kit, and the API URL is hard-coded to `http://localhost:3000`. As shortcuts, the schema is created by TypeORM from the entity instead of versioned migrations, and the `status`, `page` and `limit` query parameters on `GET /tickets` are not yet validated by a DTO, so a bad value can fail with a server error instead of a `400`. With more time I would add a query DTO for the list endpoint, migrations, a test database wired into the Jest config, frontend tests, and CI.

## Out of scope

Authentication, notifications, attachments, real-time updates and deployment were left out to stay within the scope of the assignment.
