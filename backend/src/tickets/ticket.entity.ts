import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  DEFAULT_TICKET_PRIORITY,
  DEFAULT_TICKET_STATUS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from './ticket-vocabulary';
import type { TicketPriority, TicketStatus } from './ticket-vocabulary';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  // Explicit varchar: the `string | null` union reflects as `Object`,
  // which TypeORM cannot map to a column type on its own.
  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: [...TICKET_STATUSES],
    default: DEFAULT_TICKET_STATUS,
  })
  status!: TicketStatus;

  @Column({
    type: 'enum',
    enum: [...TICKET_PRIORITIES],
    default: DEFAULT_TICKET_PRIORITY,
  })
  priority!: TicketPriority;

  @CreateDateColumn()
  createdAt!: Date;
}
