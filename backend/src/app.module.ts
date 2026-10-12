import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    // 1. Initialize ConfigModule globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 2. Use ConfigService to read DATABASE_URL with proper SSL config for Neon
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: rejectUnauthorized => rejectUnauthorized ? { rejectUnauthorized: false } : { sslmode: 'verify-full' },
        autoLoadEntities: true,
        // synchronize: false - use explicit TypeORM migrations instead
        // Run: npx typeorm migration:run to apply migrations
        logging: false,
      }),
    }),
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}