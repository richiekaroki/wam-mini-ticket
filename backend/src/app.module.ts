import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as loadEnv } from 'dotenv';
import { TicketsModule } from './tickets/tickets.module';

// dotenv over @nestjs/config: v12 is ESM-only, which the Jest (CJS) runner
// cannot import. Must load before the TypeORM factory runs.
loadEnv({ quiet: true });

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: true,
        autoLoadEntities: true,
        // DEV ONLY: sync schema from entities so a fresh checkout runs without
        // migrations; production would use `synchronize: false` + migrations.
        synchronize: true,
        logging: false,
      }),
    }),
    TicketsModule,
  ],
})
export class AppModule {}
