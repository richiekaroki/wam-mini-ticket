import type {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketListResponse,
  TicketStatsData,
} from './ticket-types';

const API_BASE = 'http://localhost:3000';

// Nest returns errors as JSON ({ message: string | string[] }); show that nicely.
async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (json.message) {
      return Array.isArray(json.message) ? json.message.join(', ') : json.message;
    }
  } catch {
    // not JSON, fall through
  }
  return text || fallback;
}

export const getTickets = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<TicketListResponse> => {
  const url = new URL(`${API_BASE}/tickets`);
  if (params.status) url.searchParams.append('status', params.status);
  if (params.page) url.searchParams.append('page', String(params.page));
  if (params.limit) url.searchParams.append('limit', String(params.limit));
  const res = await fetch(url);
  if (!res.ok) throw new Error(await readError(res, 'Failed to fetch tickets'));
  return (await res.json()) as TicketListResponse;
};

export const createTicket = async (dto: CreateTicketInput): Promise<Ticket> => {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await readError(res, 'Failed to create ticket'));
  return (await res.json()) as Ticket;
};

export const updateTicket = async (
  id: number,
  updates: UpdateTicketInput,
): Promise<Ticket> => {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await readError(res, 'Failed to update ticket'));
  return (await res.json()) as Ticket;
};

export const getStats = async (): Promise<TicketStatsData> => {
  const res = await fetch(`${API_BASE}/tickets/stats`);
  if (!res.ok) throw new Error(await readError(res, 'Failed to fetch stats'));
  return (await res.json()) as TicketStatsData;
};