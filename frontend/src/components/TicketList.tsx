import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useDeferredValue, useTransition } from 'react';
import { getTickets, updateTicket } from '../services/ticket.service';
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../services/ticket-types';

interface TicketListProps {
  refreshKey?: number;
  onTicketUpdate?: () => void;
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'badge-success',
  in_progress: 'badge-info',
  closed: 'badge-error',
};

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

const PRIORITY_BADGE: Record<TicketPriority, string> = {
  low: 'badge-info',
  medium: 'badge-warning',
  high: 'badge-error',
};

const LIMIT = 10;

export function TicketList({ refreshKey = 0, onTicketUpdate }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getTickets({
          page,
          limit: LIMIT,
          status: statusFilter || undefined,
        });
        if (!cancelled) {
          startTransition(() => {
            setTickets(data.items);
            setTotalPages(Math.max(1, data.totalPages));
            setError(null);
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to fetch tickets');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, refreshKey]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as TicketStatus | '');
    setPage(1);
  };

  const handleStatusChange = async (id: number, status: TicketStatus) => {
    try {
      await updateTicket(id, { status });
      onTicketUpdate?.(); // parent bumps refreshKey -> list and stats refetch
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update ticket');
    }
  };

  // Use deferred page value for better perceived performance
  const deferredPage = useDeferredValue(page);

  return (
    <div>
      <h2>Tickets</h2>

      <div className="form-field">
        <label className="label" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          className="input select"
          id="status-filter"
          value={statusFilter}
          onChange={handleFilterChange}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error && <p className="error-text">Error: {error}</p>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Change status</th>
            </tr>
          </thead>
          <tbody>
            {loading && tickets.length === 0 && (
              <tr>
                <td colSpan={5}>Loading tickets...</td>
              </tr>
            )}
            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan={5}>No tickets found.</td>
              </tr>
            )}
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>
                  <span className={`badge ${STATUS_BADGE[ticket.status]}`}>
                    {STATUS_LABEL[ticket.status]}
                  </span>
                </td>
                <td>
                  <span className={`badge ${PRIORITY_BADGE[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    className="input select"
                    aria-label={`Change status of ${ticket.title}`}
                    value={ticket.status}
                    onChange={(e) =>
                      void handleStatusChange(
                        ticket.id,
                        e.target.value as TicketStatus,
                      )
                    }
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="pager" aria-label="Pagination">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {deferredPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
}