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
  onRequestCreate?: () => void;
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const EMPTY_TITLE: Record<TicketStatus, string> = {
  open: 'No open tickets',
  in_progress: 'No tickets in progress',
  closed: 'No closed tickets',
};

const PRIORITY_LEVEL: Record<TicketPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const LIMIT = 10;
const SKELETON_ROWS = 5;

export function TicketList({
  refreshKey = 0,
  onTicketUpdate,
  onRequestCreate,
}: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [reload, setReload] = useState(0);
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
            setTotal(data.total);
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
  }, [page, statusFilter, refreshKey, reload]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as TicketStatus | '');
    setPage(1);
  };

  const clearFilter = () => {
    setStatusFilter('');
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

  const showEmpty = !loading && !error && tickets.length === 0;

  return (
    <div>
      <div className="panel-head">
        <div>
          <p className="eyebrow">Queue</p>
          <h2>Tickets</h2>
        </div>
        <div className="panel-tools">
          <span className="panel-count mono">
            {total} {total === 1 ? 'ticket' : 'tickets'}
          </span>
          <label className="sr-only" htmlFor="status-filter">
            Filter tickets by status
          </label>
          <select
            className="select select-sm"
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
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setReload((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {showEmpty ? (
        <div className="empty">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v2a2 2 0 0 0 0 4v2A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-2a2 2 0 0 0 0-4v-2Z" />
            <path d="M14 7v11" strokeDasharray="2 2.5" />
          </svg>
          {statusFilter ? (
            <>
              <h3>{EMPTY_TITLE[statusFilter]}</h3>
              <p>
                Nothing in the queue has this status right now. Clear the
                filter to see every ticket.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearFilter}
              >
                Clear filter
              </button>
            </>
          ) : (
            <>
              <h3>The queue is clear</h3>
              <p>
                Nothing is waiting on the desk. File a ticket and it will show
                up here.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onRequestCreate}
              >
                Create a ticket
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="queue">
            <thead>
              <tr>
                <th scope="col">Ticket</th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Change status</th>
              </tr>
            </thead>
            <tbody>
              {loading && tickets.length === 0 &&
                Array.from({ length: SKELETON_ROWS }, (_, i) => (
                  <tr className="skeleton-row" key={`skeleton-${i}`}>
                    <td>
                      <span className="skeleton-bar w-4ch" />
                    </td>
                    <td>
                      <span className="skeleton-bar w-14rem" />
                    </td>
                    <td>
                      <span className="skeleton-bar w-5rem" />
                    </td>
                    <td>
                      <span className="skeleton-bar w-4ch" />
                    </td>
                    <td>
                      <span className="skeleton-bar w-6rem" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                tickets.map((ticket) => (
                  <tr className={`row row-${ticket.status}`} key={ticket.id}>
                    <td className="cell-id">#{String(ticket.id).padStart(4, '0')}</td>
                    <td className="cell-title">
                      <span className="row-title" title={ticket.title}>
                        {ticket.title}
                      </span>
                      <span className="row-meta">
                        <time className="row-date" dateTime={ticket.createdAt}>
                          {DATE_FORMAT.format(new Date(ticket.createdAt))}
                        </time>
                        {ticket.description && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="row-desc" title={ticket.description}>
                              {ticket.description}
                            </span>
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${ticket.status}`}>
                        <span className="dot" aria-hidden="true" />
                        {STATUS_LABEL[ticket.status]}
                      </span>
                    </td>
                    <td>
                      <span className={`prio prio-${ticket.priority}`}>
                        <span className="prio-bars" aria-hidden="true">
                          {[0, 1, 2].map((i) => (
                            <i
                              key={i}
                              className={
                                i < PRIORITY_LEVEL[ticket.priority]
                                  ? 'is-on'
                                  : undefined
                              }
                            />
                          ))}
                        </span>
                        <span className="prio-name">
                          {PRIORITY_LABEL[ticket.priority]}
                        </span>
                      </span>
                    </td>
                    <td>
                      <select
                        className="select select-sm"
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
      )}

      {!showEmpty && !error && (
        <nav className="panel-foot" aria-label="Pagination">
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="page-status">
            Page {deferredPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
