import { Ticket } from './ticket.entity';
import type { UpdateTicketDto } from './dto/update-ticket.dto';
import type { TicketPriority, TicketStatus } from './ticket-vocabulary';

/**
 * One normaliser per updatable field. This map drives both the
 * "at least one field was sent" check and the merge itself, so the
 * PATCH logic asks each "was this field provided?" question exactly once.
 */
const NORMALISERS = {
  title: (value: string) => value.trim(),
  // The description column is nullable: an explicit null clears it.
  description: (value: string | null) => value?.trim() ?? null,
  status: (value: TicketStatus) => value,
  priority: (value: TicketPriority) => value,
} satisfies Record<keyof UpdateTicketDto, (value: never) => unknown>;

/**
 * DTO validation guarantees strings/enums here; `description` is the one
 * field that may legally arrive as null (which clears it).
 */
export function buildTicketPatch(dto: UpdateTicketDto): Partial<Ticket> {
  const patch: Record<string, unknown> = {};
  for (const field of Object.keys(NORMALISERS) as Array<
    keyof UpdateTicketDto
  >) {
    const value = dto[field];
    if (value === undefined) continue;
    patch[field] = NORMALISERS[field](value as never);
  }
  return patch;
}
