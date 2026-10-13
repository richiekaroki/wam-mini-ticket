import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TICKET_STATUSES } from '../ticket-vocabulary';
import type { TicketStatus } from '../ticket-vocabulary';

/**
 * Query params arrive as strings, so `@Type(() => Number)` converts page/limit
 * before validation - invalid input (e.g. ?page=abc) now yields a 400 instead
 * of a NaN being passed to the database.
 */
export class ListTicketsQueryDto {
  @IsOptional()
  @IsIn([...TICKET_STATUSES])
  status?: TicketStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
