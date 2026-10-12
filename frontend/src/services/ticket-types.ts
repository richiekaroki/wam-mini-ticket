export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  // NestJS/TypeORM entity serialises as camelCase. If your API returns
  // created_at instead, rename this field to match.
  createdAt: string;
}

export interface CreateTicketInput {
  title: string;
  description?: string | null;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketFormValues {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface TicketListResponse {
  items: Ticket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type TicketStatsData = Record<TicketStatus, number>;