# wam-mini-ticket

Assessment project: Full-stack ticket tracking system (NestJS + React)

## Overview

Backend (NestJS 11) + Frontend (React 19) application for creating, listing, and updating tickets. Built as a take-home assessment.

## Tech Stack

- **Backend:** NestJS 11, TypeScript, TypeORM, PostgreSQL
- **Frontend:** React 19, TypeScript, Vite

## Core Features

- Create tickets (title required, description/priority/status optional)
- List tickets with status filtering and pagination
- Update ticket status via PATCH
- Status statistics summary

## Project Structure

```
backend/src/          # NestJS module, controller, service, entity, DTOs
frontend/src/         # React components (CreateTicket, TicketList, TicketStats), services, styles
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # edit DATABASE_URL with your Neon PostgreSQL connection string
npm run build           # compile TypeScript
npm run start:dev       # runs at http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev             # runs at http://localhost:5173
```

### Environment Variables

See `backend/.env.example` for required variables:

```
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require&channel_binding=require
```

**Important:** The `.env.example` originally contained real Neon credentials. These were replaced with placeholder markers (`REPLACE_ME`) for safe sharing. Replace with your actual connection string before running.

### Windows (PowerShell) Quick Start

```powershell
# Backend
cd backend
npm install
Copy-Item .env.example .env
# Edit .env with your DATABASE_URL
npm run build
npm run start:dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## API Reference

### Create Ticket

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

**Response:** 201 Created - ticket object

**Errors:**
- 400 Bad Request - title is required, max 255 chars, must not be blank
- 422 Validation failed - invalid priority or status values

### List Tickets

```http
GET /tickets?status=open&page=1&limit=10
```

**Query Parameters:**
- `status`: filter by 'open' | 'in_progress' | 'closed' (optional)
- `page`: page number, default 1
- `limit`: items per page, max 100, default 10

**Response:**
```json
{
  "items": [{ id, title, status, priority, createdAt }],
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1
}
```

### Update Ticket

```http
PATCH /tickets/:id
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Errors:**
- 404 Not Found - ticket ID does not exist
- 400 Bad Request - at least one field must be provided for update

### Get Stats

```http
GET /tickets/stats
```

**Response:**
```json
{
  "open": 3,
  "in_progress": 1,
  "closed": 2
}
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:** Integration tests cover ticket CRUD, status filtering, pagination, and statistics.

**Test Command (PowerShell):**

```powershell
cd backend
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/db_name"
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Database Credentials Security

**⚠️ Important:** The `backend/.env.example` file originally contained real Neon PostgreSQL connection credentials. These were replaced with placeholder markers (`REPLACE_ME`) for safe sharing. 

Before running the application:

1. Review `backend/.env.example` - it now uses `REPLACE_ME` markers
2. Create `backend/.env` with your actual Neon connection string
3. **Never** commit real database credentials to version control

## Notes

- Designed for assessment purposes
- Out of scope: auth, notifications, attachments, real-time updates, deployment
- Frontend uses React `useTransition` for smooth async state updates
- Backend uses TypeORM with Neon PostgreSQL SSL configuration
- Validation: DTOs use class-validator decorators with NestJS ValidationPipe