import { useEffect, useState } from 'react';
import { useTransition } from 'react';
import { getStats } from '../services/ticket.service';
import type { TicketStatsData } from '../services/ticket-types';

interface TicketStatsProps {
  refreshKey?: number;
}

const CARDS: { key: keyof TicketStatsData; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'closed', label: 'Closed' },
];

export function TicketStats({ refreshKey = 0 }: TicketStatsProps) {
  const [stats, setStats] = useState<TicketStatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  }, [refreshKey]);

  return (
    <div>
      <h2>Ticket Summary</h2>
      {error && <p className="error-text">Error: {error}</p>}
      <div className="stats-grid">
        {CARDS.map(({ key, label }) => (
          <div className="stat-card" key={key}>
            <div className="stat-number">{stats?.[key] ?? 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}