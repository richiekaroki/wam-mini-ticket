import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { createTicket } from '../services/ticket.service';
import type { TicketFormValues } from '../services/ticket-types';

interface CreateTicketProps {
  onSuccess?: () => void;
}

const EMPTY_FORM: TicketFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'open',
};

export function CreateTicket({ onSuccess }: CreateTicketProps) {
  const [form, setForm] = useState<TicketFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createTicket({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        status: form.status,
      });
      setForm(EMPTY_FORM);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="label" htmlFor="title">
            Title *
          </label>
          <input
            className="input"
            id="title"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            className="textarea"
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select
            className="input select"
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

        <div className="form-field">
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            className="input select"
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

        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}