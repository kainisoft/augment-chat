import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { RateLimitService } from './rate-limit.service';
import { LoggingService } from '@app/logging';

/**
 * Rate limit metadata
 */
export interface RateLimitMetadata {
  /**
   * Action type
   */
  action: 'login' | 'registration' | 'password-reset';

  /**
   * Key extractor function
   * @param request Request object
   * @returns Rate limit key
   */
  keyExtractor?: (request: FastifyRequest) => string;
}

/**
 * Rate Limit Guard
 *
 * Guard to protect routes from rate limiting
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this guard
    this.loggingService.setContext(RateLimitGuard.name);
  }

  /**
   * Check if the request can activate the route
   * @param context Execution context
   * @returns True if the request can activate the route
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get rate limit metadata from handler or controller
    const metadata = this.reflector.getAllAndOverride<RateLimitMetadata>(
      'rateLimit',
      [context.getHandler(), context.getClass()],
    );

    // If no metadata, allow the request
    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { action, keyExtractor } = metadata;

    // Extract key from request
    const key = keyExtractor
      ? keyExtractor(request)
      : this.getDefaultKey(request);

    // Check if rate limited
    const isLimited = await this.rateLimitService.isRateLimited(key, action);
    if (isLimited) {
      this.loggingService.warn(
        `Rate limit exceeded for ${action} by ${key}`,
        'canActivate',
        { key, action, ip: request.ip },
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    await this.rateLimitService.increment(key, action);

    return true;
  }

  /**
   * Get default key from request
   * @param request Request object
   * @returns Rate limit key
   */
  private getDefaultKey(request: FastifyRequest): string {
    // Use IP address as default key
    return request.ip || 'unknown';
  }
}
