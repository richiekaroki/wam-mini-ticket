/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../app.module';
import { Ticket } from './ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

interface ListResponse {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsResponse {
  open: number;
  in_progress: number;
  closed: number;
}

describe('Tickets API Integration Tests', () => {
  let app: INestApplication;
  let repo: Repository<Ticket>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Must be resolved AFTER the app exists (it was at describe-level before)
    repo = app.get<Repository<Ticket>>(getRepositoryToken(Ticket));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  describe('POST /tickets', () => {
    it('should create a valid ticket and return 201', async () => {
      const dto: CreateTicketDto = { title: 'Test ticket' };
      const res = await request(app.getHttpServer())
        .post('/tickets')
        .send(dto)
        .expect(201);

      const body = res.body as Ticket;
      expect(body.title).toBe('Test ticket');
      expect(body.status).toBe('open');
      expect(body.priority).toBe('medium');
      expect(body.id).toBeDefined();
    });

    it('should reject blank title and return 400', async () => {
      const dto: CreateTicketDto = { title: '   ' };
      await request(app.getHttpServer()).post('/tickets').send(dto).expect(400);
    });

    it('should reject missing title and return 400', async () => {
      await request(app.getHttpServer()).post('/tickets').send({}).expect(400);
    });

    it('should reject invalid status value and return 400', async () => {
      await request(app.getHttpServer())
        .post('/tickets')
        .send({ title: 'Test', status: 'invalid' })
        .expect(400);
    });

    it('should reject invalid priority value and return 400', async () => {
      await request(app.getHttpServer())
        .post('/tickets')
        .send({ title: 'Test', priority: 'invalid' })
        .expect(400);
    });
  });

  describe('GET /tickets', () => {
    it('should list tickets with status filter', async () => {
      await repo.save(repo.create({ title: 'Open 1', status: 'open' }));
      await repo.save(repo.create({ title: 'Open 2', status: 'open' }));
      await repo.save(repo.create({ title: 'Closed 1', status: 'closed' }));

      const res = await request(app.getHttpServer())
        .get('/tickets?status=open')
        .expect(200);

      const body = res.body as ListResponse;
      expect(body.items).toHaveLength(2);
      expect(body.total).toBe(2);
      expect(body.page).toBe(1);
      expect(body.totalPages).toBe(1);
    });

    it('should apply pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await repo.save(repo.create({ title: `Ticket ${i}` }));
      }

      const res = await request(app.getHttpServer())
        .get('/tickets?page=2&limit=5')
        .expect(200);

      const body = res.body as ListResponse;
      expect(body.items).toHaveLength(5);
      expect(body.total).toBe(15);
      expect(body.page).toBe(2);
      expect(body.totalPages).toBe(3);
    });
  });

  describe('PATCH /tickets/:id', () => {
    it('should update a ticket status and return 200', async () => {
      const created = await repo.save(
        repo.create({ title: 'Updatable', status: 'open' }),
      );
      const res = await request(app.getHttpServer())
        .patch(`/tickets/${created.id}`)
        .send({ status: 'closed' })
        .expect(200);

      expect((res.body as Ticket).status).toBe('closed');
    });

    it('should return 404 for missing ticket', async () => {
      await request(app.getHttpServer())
        .patch('/tickets/9999')
        .send({ status: 'closed' })
        .expect(404);
    });

    it('should reject empty update payload and return 400', async () => {
      const created = await repo.save(repo.create({ title: 'No Updates' }));
      await request(app.getHttpServer())
        .patch(`/tickets/${created.id}`)
        .send({})
        .expect(400);
    });

    it('should update priority', async () => {
      const created = await repo.save(
        repo.create({ title: 'Priority change', priority: 'low' }),
      );
      const res = await request(app.getHttpServer())
        .patch(`/tickets/${created.id}`)
        .send({ priority: 'high' })
        .expect(200);

      expect((res.body as Ticket).priority).toBe('high');
    });
  });

  describe('GET /tickets/stats', () => {
    it('should return stats with zero counts for no tickets', async () => {
      const res = await request(app.getHttpServer())
        .get('/tickets/stats')
        .expect(200);

      expect(res.body as StatsResponse).toEqual({
        open: 0,
        in_progress: 0,
        closed: 0,
      });
    });

    it('should return stats reflecting ticket statuses', async () => {
      await repo.save(repo.create({ title: 'Open', status: 'open' }));
      await repo.save(
        repo.create({ title: 'In Progress', status: 'in_progress' }),
      );
      await repo.save(repo.create({ title: 'Closed', status: 'closed' }));

      const res = await request(app.getHttpServer())
        .get('/tickets/stats')
        .expect(200);

      expect(res.body as StatsResponse).toEqual({
        open: 1,
        in_progress: 1,
        closed: 1,
      });
    });
  });
});
