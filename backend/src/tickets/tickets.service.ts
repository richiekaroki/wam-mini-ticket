/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketsService {
  constructor(@InjectRepository(Ticket) private repo: Repository<Ticket>) {}

  async create(dto: CreateTicketDto) {
    const ticket = this.repo.create({
      title: dto.title.trim(),
      description: dto.description?.trim(),
      status: dto.status ?? 'open',
      priority: dto.priority ?? 'medium',
    });
    return this.repo.save(ticket);
  }

  async findAll(statusFilter?: string, page?: string, limit?: string) {
    const pageNum = Math.max(1, parseInt(page ?? '1', 10));
    const limitNum = Math.min(Math.max(1, parseInt(limit ?? '10', 10)), 100);

    const where: FindOptionsWhere<Ticket> = statusFilter
      ? { status: statusFilter as 'open' | 'in_progress' | 'closed' }
      : {};

    const [items, total] = await this.repo.findAndCount({
      where,
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
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

    // Reject empty update payloads - at least one field must be provided
    const hasUpdates =
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.status !== undefined ||
      dto.priority !== undefined;

    if (!hasUpdates) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    if (dto.title !== undefined) {
      ticket.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      ticket.description = dto.description.trim();
    }
    if (dto.status !== undefined) {
      ticket.status = dto.status;
    }
    if (dto.priority !== undefined) {
      ticket.priority = dto.priority;
    }

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