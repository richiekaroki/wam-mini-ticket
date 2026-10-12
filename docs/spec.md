# Ticket Management Specification

## Overview
A full-stack ticket tracking system with backend (NestJS) and frontend (React) components. Users can create, view, update, and get statistics on tickets.

## API Endpoints

### POST /tickets
- **Action:** Create a new ticket
- **Request Body:**
  - `title` (string, required) - Ticket title, must not be blank, max 255 characters
  - `description` (string, optional) - Ticket description, max 1000 characters if provided
  - `status` (enum, optional) - Ticket status: 'open' | 'in_progress' | 'closed'. Default: 'open'
  - `priority` (enum, optional) - Ticket priority: 'low' | 'medium' | 'high'. Default: 'medium'
- **Response:** Created ticket object

### GET /tickets
- **Action:** List tickets with pagination and optional filtering
- **Query Parameters:**
  - `page` (integer, optional) - Page number, default: 1
  - `limit` (integer, optional) - Items per page, max 100, default: 10
  - `status` (enum, optional) - Filter by status: 'open' | 'in_progress' | 'closed'
- **Response:** Paginated ticket list with total count and total pages

### PATCH /tickets/:id
- **Action:** Update an existing ticket (status change)
- **Request Body:**
  - `status` (enum, optional) - New ticket status
  - `priority` (enum, optional) - New priority level
  - `title` (string, optional) - Updated title
  - `description` (string, optional) - Updated description
- **Response:** Updated ticket object
- **Note:** At least one field must be provided for the update

### GET /tickets/stats
- **Action:** Get ticket statistics grouped by status
- **Response:** Object with counts for each status:
  - `open`: number of open tickets
  - `in_progress`: number of in-progress tickets
  - `closed`: number of closed tickets

## Data Models

### Ticket Entity
- `id` (number, auto-generated primary key)
- `title` (string, required, max 255 chars)
- `description` (string, optional, nullable)
- `status` (enum: 'open' | 'in_progress' | 'closed', default: 'open')
- `priority` (enum: 'low' | 'medium' | 'high', default: 'medium')
- `createdAt` (date, auto-generated)

### CreateTicketDto
- `title: string` @ IsString(), @ MaxLength(255)
- `description?: string` @ IsString(), @ IsOptional(), @ MaxLength(1000)
- `status?: 'open' | 'in_progress' | 'closed'` @ IsOptional(), @ IsIn([])
- `priority?: 'low' | 'medium' | 'high'` @ IsOptional(), @ IsIn([])

### UpdateTicketDto
- `title?: string` @ IsOptional(), @ IsString(), @ MaxLength(255)
- `description?: string` @ IsOptional(), @ IsString(), @ MaxLength(1000)
- `status?: 'open' | 'in_progress' | 'closed'` @ IsOptional(), @ IsIn([])
- `priority?: 'low' | 'medium' | 'high'` @ IsOptional(), @ IsIn([])

## Business Rules

1. **Title required:** Title field must not be blank (validated via @IsNotBlank or equivalent)
2. **Max length:** Title max 255 chars, description max 1000 chars
3. **Status validation:** Must be one of: open, in_progress, closed
4. **Priority validation:** Must be one of: low, medium, high
5. **At least one update field:** PATCH requests must include at least one modifiable field
6. **Default values:** New tickets default to status='open' and priority='medium'

## Security Considerations

- **SSL:** Connection must use `sslmode=verify-full` for Neon PostgreSQL
- **No authentication** in this MVP version (to be added in production)
- **Input validation:** All DTOs validated via class-validator with whitelisting
- **SQL injection protection:** TypeORM with parameterized queries

## Development Guidelines

1. **TypeORM:** Use `synchronize: false` in production; run `npx typeorm migration:run` for schema changes
2. **Error handling:** Use NestJS Exception Filters; return meaningful error messages
3. **ValidationPipe:** Configure with `whitelist: true, forbidNonWhitelisted: true, transform: true`
4. **Code style:** Follow existing NestJS conventions; use ESLint and Prettier
5. **Testing:** Write unit tests for services and integration tests for API endpoints

## Known Limitations (Future Considerations)

1. **Authentication/authorization** - Not implemented; all endpoints are open
2. **DELETE endpoint** - Ticket removal not yet implemented
3. **Rate limiting** - Not configured
4. **API documentation** - Consider Swagger/OpenAPI specification
5. **Database backups** - Neon provides automated backups; no custom backup setup