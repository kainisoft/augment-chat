import { SetMetadata } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

/**
 * Rate limit decorator
 * @param action Action type
 * @param keyExtractor Key extractor function
 * @returns Decorator
 */
export const RateLimit = (
  action: 'login' | 'registration' | 'password-reset',
  keyExtractor?: (request: FastifyRequest) => string,
) => SetMetadata('rateLimit', { action, keyExtractor });
