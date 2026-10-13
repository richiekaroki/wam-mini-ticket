# Glossary

Domain language for wam-mini-ticket. Use these names in code, docs and architecture reviews.

- **Ticket** — the tracked record: id, title, optional nullable description, status, priority, createdAt.
- **Ticket vocabulary** — the closed value sets `TICKET_STATUSES` / `TICKET_PRIORITIES` and their derived types; single-sourced in `backend/src/tickets/ticket-vocabulary.ts` and consumed by the DTOs, the entity and the service defaults.
- **Ticket patch** — the normalised partial update built from a PATCH payload (`buildTicketPatch` in `backend/src/tickets/ticket-patch.ts`). "Present" means the field arrived, including an explicit `null` for the nullable description, which clears it.
- **Validation seam** — `VALIDATION_PIPE_OPTIONS` and `HttpExceptionFilter` in `backend/src/common/`; the one interface the HTTP bootstrap and the integration suite both consume.
