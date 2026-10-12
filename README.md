# wam-mini-ticket

Assessment project: Full-stack ticket tracking system (NestJS + React)

## Overview

Backend (NestJS) + Frontend (React) application for creating, listing, and updating tickets. Built as a take-home assessment.

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

```bash
# Backend
cd backend
npm install
cp .env.example .env    # edit DATABASE_URL
npm run start:dev       # http://localhost:3000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

## Testing

```bash
cd backend
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/db_name npm test
```

## Notes

- Private documentation (`docs/` folder) is kept local — not committed to this repo
- Designed for assessment purposes; out of scope: auth, notifications, attachments, real-time updates, deployment