import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export type TicketStatus = 'open' | 'in_progress' | 'closed';

/**
 * Validated query string for GET /tickets.
 * Query params arrive as strings, so `@Type(() => Number)` converts page/limit
 * before validation - invalid input (e.g. ?page=abc) now yields a 400 instead
 * of a NaN being passed to the database.
 */
export class ListTicketsQueryDto {
  @IsOptional()
  @IsIn(['open', 'in_progress', 'closed'])
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
