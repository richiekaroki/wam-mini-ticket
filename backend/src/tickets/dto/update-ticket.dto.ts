import {
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsNotBlank } from '../../common/decorators';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../ticket-vocabulary';
import type { TicketPriority, TicketStatus } from '../ticket-vocabulary';

/**
 * `description` keeps @IsOptional so an explicit null clears the nullable
 * column; the other fields are optional only when *omitted* - sending null
 * there is a 400, not a crash.
 */
export class UpdateTicketDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotBlank()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsIn([...TICKET_STATUSES])
  status?: TicketStatus;

  @ValidateIf((_object, value) => value !== undefined)
  @IsIn([...TICKET_PRIORITIES])
  priority?: TicketPriority;
}
