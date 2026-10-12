import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as loadEnv } from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';

// Loads backend/.env into process.env before the TypeORM factory runs.
// We use dotenv directly rather than @nestjs/config because the latter is
// ESM-only since v12, which the Jest (CJS) test runner cannot import.
loadEnv({ quiet: true });

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: true,
        autoLoadEntities: true,
        // DEV ONLY: keep the schema in sync with the entities so a fresh
        // checkout works without a migration step. For production, switch this
        // to `synchronize: false` and manage the schema with TypeORM
        // migrations (`npx typeorm migration:run`).
        synchronize: true,
        logging: false,
      }),
    }),
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
