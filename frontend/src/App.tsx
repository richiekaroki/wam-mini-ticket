import { useState, useTransition } from 'react';
import { CreateTicket } from './components/CreateTicket';
import { TicketStats } from './components/TicketStats';
import { TicketList } from './components/TicketList';

export default function App() {
  // Bumping this number tells the stats and the list to refetch.
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini Ticket Tracker</h1>
        <p>A lightweight ticket tracker</p>
      </header>

      <main className="container">
        <div className="layout">
          <section className="layout-stats">
            {isPending && <p>Loading stats...</p>}
            <TicketStats refreshKey={refreshKey} />
          </section>

          <section className="card">
            <CreateTicket onSuccess={refresh} />
          </section>

          <section className="card">
            <TicketList refreshKey={refreshKey} onTicketUpdate={refresh} />
          </section>
        </div>
      </main>
    </div>
  );
}