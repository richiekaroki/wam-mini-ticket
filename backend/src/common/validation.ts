import { ValidationPipeOptions } from '@nestjs/common';

/**
 * The single ValidationPipe configuration. main.ts and the integration
 * suite both consume it, so the tests exercise the exact options that
 * production runs (whitelist, forbidNonWhitelisted, transform).
 */
export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};
