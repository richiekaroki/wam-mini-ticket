import { useEffect, useState } from 'react';
import { useTransition } from 'react';
import type { ReactNode } from 'react';
import { getStats } from '../services/ticket.service';
import type { TicketStatsData } from '../services/ticket-types';

interface TicketStatsProps {
  refreshKey?: number;
}

const CARDS: {
  key: keyof TicketStatsData;
  label: string;
  icon: ReactNode;
}[] = [
  {
    key: 'open',
    label: 'Open',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </svg>
    ),
  },
];

export function TicketStats({ refreshKey = 0 }: TicketStatsProps) {
  const [stats, setStats] = useState<TicketStatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getStats();
        if (!cancelled) {
          startTransition(() => {
            setStats(data);
            setError(null);
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to fetch stats');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, retry]);

  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        <span>Summary unavailable — {error}</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setRetry((n) => n + 1)}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="summary" aria-label="Ticket summary">
      {CARDS.map(({ key, label, icon }) => (
        <div className={`summary-seg seg-${key}`} key={key}>
          <div className="summary-top">
            {icon}
            <span className="summary-label">{label}</span>
          </div>
          <div className="summary-count">
            {stats ? (
              stats[key]
            ) : (
              <span className="skeleton-num" aria-hidden="true" />
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
