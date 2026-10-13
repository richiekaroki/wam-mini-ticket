import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { IsNotBlank } from '../../common/decorators';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../ticket-vocabulary';
import type { TicketPriority, TicketStatus } from '../ticket-vocabulary';

export class CreateTicketDto {
  @IsString()
  @IsNotBlank()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn([...TICKET_STATUSES])
  status?: TicketStatus;

  @IsOptional()
  @IsIn([...TICKET_PRIORITIES])
  priority?: TicketPriority;
}
