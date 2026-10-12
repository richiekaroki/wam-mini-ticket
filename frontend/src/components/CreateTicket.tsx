import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { createTicket } from '../services/ticket.service';
import type { TicketFormValues } from '../services/ticket-types';

interface CreateTicketProps {
  onSuccess?: () => void;
  /** Bumped by the app when a "New ticket" action should focus the title. */
  focusSignal?: number;
}

const EMPTY_FORM: TicketFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'open',
};

export function CreateTicket({
  onSuccess,
  focusSignal = 0,
}: CreateTicketProps) {
  const [form, setForm] = useState<TicketFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSignal === 0) return;
    const el = inputRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'center',
    });
    el.focus({ preventScroll: true });
  }, [focusSignal]);

  // Auto-dismiss the success note; cleaned up if the form is unmounted.
  useEffect(() => {
    if (created === null) return;
    const timer = window.setTimeout(() => setCreated(null), 6000);
    return () => window.clearTimeout(timer);
  }, [created]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Give the ticket a title before creating it.');
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createTicket({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        status: form.status,
      });
      setForm(EMPTY_FORM);
      setCreated(ticket.id);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="panel-head">
        <div>
          <p className="eyebrow">New ticket</p>
          <h2>File a ticket</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="field-label" htmlFor="title">
            Title
          </label>
          <input
            className="input"
            id="title"
            name="title"
            required
            maxLength={255}
            placeholder="What does the requester need?"
            value={form.title}
            onChange={handleChange}
            ref={inputRef}
            aria-describedby="title-hint"
          />
          <span className="hint" id="title-hint">
            Required — up to 255 characters
          </span>
        </div>

        <div className="form-field">
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            className="textarea"
            id="description"
            name="description"
            maxLength={1000}
            placeholder="Context, steps, links — whatever helps the next person."
            value={form.description}
            onChange={handleChange}
            aria-describedby="description-hint"
          />
          <span className="hint" id="description-hint">
            Optional — up to 1,000 characters
          </span>
        </div>

        <div className="form-field field-row">
          <div>
            <label className="field-label" htmlFor="priority">
              Priority
            </label>
            <select
              className="select"
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="status">
              Status
            </label>
            <select
              className="select"
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating…' : 'Create ticket'}
        </button>
      </form>

      {error && (
        <p className="alert alert-error form-note" role="alert">
          {error}
        </p>
      )}
      {created !== null && (
        <p className="alert alert-success form-note" role="status">
          Ticket #{String(created).padStart(4, '0')} created — it is now in the
          queue.
        </p>
      )}
    </div>
  );
}
