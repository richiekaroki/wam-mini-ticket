/**
 * Single source of truth for the ticket status/priority vocabulary; the DTOs,
 * entity columns and service defaults all derive from these arrays.
 */
export const TICKET_STATUSES = ['open', 'in_progress', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export const DEFAULT_TICKET_STATUS: TicketStatus = 'open';

export const TICKET_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export const DEFAULT_TICKET_PRIORITY: TicketPriority = 'medium';
