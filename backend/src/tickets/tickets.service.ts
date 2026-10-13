import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets.query.dto';
import { Ticket } from './ticket.entity';
import { buildTicketPatch } from './ticket-patch';
import {
  DEFAULT_TICKET_PRIORITY,
  DEFAULT_TICKET_STATUS,
} from './ticket-vocabulary';

@Injectable()
export class TicketsService {
  constructor(@InjectRepository(Ticket) private repo: Repository<Ticket>) {}

  async create(dto: CreateTicketDto) {
    const ticket = this.repo.create({
      title: dto.title.trim(),
      description: dto.description?.trim(),
      status: dto.status ?? DEFAULT_TICKET_STATUS,
      priority: dto.priority ?? DEFAULT_TICKET_PRIORITY,
    });
    return this.repo.save(ticket);
  }

  async findAll(query: ListTicketsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: FindOptionsWhere<Ticket> = query.status
      ? { status: query.status }
      : {};

    const [items, total] = await this.repo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const ticket = await this.repo.findOneBy({ id });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.findOne(id);

    const patch = buildTicketPatch(dto);
    if (Object.keys(patch).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    Object.assign(ticket, patch);
    return this.repo.save(ticket);
  }

  async getStats() {
    // getRawMany<T>() is typed, unlike repo.query() which returns `any`
    const results = await this.repo
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany<{ status: string; count: string }>();

    const map: Record<string, number> = {
      open: 0,
      in_progress: 0,
      closed: 0,
    };

    for (const row of results) {
      map[row.status] = Number(row.count);
    }

    return map;
  }
}
