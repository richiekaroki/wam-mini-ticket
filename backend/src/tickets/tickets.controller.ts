import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets.query.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private service: TicketsService) {}

  // Input validation is handled by the global ValidationPipe configured in
  // main.ts (and in the integration tests), so it is not repeated here.
  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: ListTicketsQueryDto) {
    return this.service.findAll(query);
  }

  // Declared before the parameterized routes so it never matches as an :id
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketDto) {
    return this.service.update(id, dto);
  }
}
