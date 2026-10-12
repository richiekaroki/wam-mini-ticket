import { useCallback, useState, useTransition } from 'react';
import type { CSSProperties } from 'react';
import { CreateTicket } from './components/CreateTicket';
import { TicketStats } from './components/TicketStats';
import { TicketList } from './components/TicketList';

export default function App() {
  // Bumping this number tells the stats and the list to refetch.
  const [refreshKey, setRefreshKey] = useState(0);
  // Bumped by the "New ticket" actions; CreateTicket focuses its title
  // field when this changes.
  const [focusSignal, setFocusSignal] = useState(0);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    // Bumping refreshKey is a non-urgent update; transition keeps the
    // current list visible until the refetch settles.
    startTransition(() => setRefreshKey((k) => k + 1));
  };

  const focusNewTicket = useCallback(() => {
    setFocusSignal((n) => n + 1);
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="brand">
            <svg
              className="brand-mark"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v2a2 2 0 0 0 0 4v2A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-2a2 2 0 0 0 0-4v-2Z" />
              <path d="M14 7v11" strokeDasharray="2 2.5" />
            </svg>
            <span className="brand-name">Mini Ticket Tracker</span>
            <span className="brand-sub">Lodwar Services</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={focusNewTicket}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M10 4v12M4 10h12" />
            </svg>
            New ticket
          </button>
        </div>
      </header>

      <main id="main" className="shell main">
        <section
          className="intro reveal"
          style={{ '--d': '40ms' } as CSSProperties}
        >
          <p className="eyebrow">Service desk — queue</p>
          <h1>Tickets, under control.</h1>
          <p className="intro-line">
            File new requests, watch the queue, and move tickets from open to
            closed.
          </p>
        </section>

        <div
          className="stack"
          data-pending={isPending ? '' : undefined}
          aria-busy={isPending}
        >
          <div className="reveal" style={{ '--d': '110ms' } as CSSProperties}>
            <TicketStats refreshKey={refreshKey} />
          </div>

          <div className="workspace">
            <section
              className="panel reveal"
              style={{ '--d': '180ms' } as CSSProperties}
              aria-label="New ticket form"
            >
              <CreateTicket
                onSuccess={refresh}
                focusSignal={focusSignal}
              />
            </section>

            <section
              className="panel reveal"
              style={{ '--d': '240ms' } as CSSProperties}
              aria-label="Ticket queue"
            >
              <TicketList
                refreshKey={refreshKey}
                onTicketUpdate={refresh}
                onRequestCreate={focusNewTicket}
              />
            </section>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="shell footer-inner">
          <span>Mini Ticket Tracker</span>
          <span className="mono">NestJS · React · PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
