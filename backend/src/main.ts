/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { VALIDATION_PIPE_OPTIONS } from './common/validation';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.useGlobalFilters(new HttpExceptionFilter());

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  if (
    process.env.NODE_ENV === 'production' &&
    corsOrigin.includes('localhost')
  ) {
    new Logger('CORS').warn(
      `CORS_ORIGIN is "${corsOrigin}" while NODE_ENV=production - browsers on any other origin will be blocked. Set CORS_ORIGIN to the deployed frontend URL.`,
    );
  }
  app.enableCors({ origin: corsOrigin });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
