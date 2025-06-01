import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateGuardService } from '../services';
import {
  RATE_LIMIT_KEY,
  RATE_LIMIT_SKIP_KEY,
  RATE_LIMIT_KEY_GENERATOR_KEY,
  RateLimitAction,
} from '../decorators/rate-limit.decorator';
import { FastifyRequest } from 'fastify';
import { RateGuardOptions } from '../interfaces';

/**
 * Rate Limit Metadata Interface
 *
 * Metadata stored by the @RateLimit decorator.
 */
export interface RateLimitMetadata {
  action: RateLimitAction;
  config: RateGuardOptions;
}

/**
 * Rate Limit Guard
 *
 * Guard that enforces rate limiting based on metadata set by the @RateLimit decorator.
 * This guard works with the shared RateLimitService and supports:
 * - Predefined action types (login, registration, password-reset, api-call)
 * - Custom configurations
 * - Custom key generators
 * - Skip functionality for specific endpoints
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * @UseGuards(RateLimitGuard)
 * export class AuthController {
 *   @Post('login')
 *   @RateLimit('login')
 *   async login(@Body() loginDto: LoginDto) {
 *     // Login logic
 *   }
 * }
 * ```
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateGuardService: RateGuardService,
  ) {}

  /**
   * Check if the request can activate the route
   *
   * @param context - Execution context
   * @returns True if the request can activate the route
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if rate limiting should be skipped
    const shouldSkip = this.reflector.getAllAndOverride<boolean>(
      RATE_LIMIT_SKIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (shouldSkip) {
      return true;
    }

    // Get rate limit metadata from handler or controller
    const metadata = this.reflector.getAllAndOverride<RateLimitMetadata>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no metadata, allow the request
    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const { action, config } = metadata;

    // Get custom key generator if provided
    const customKeyGenerator = this.reflector.getAllAndOverride<
      (req: any) => string
    >(RATE_LIMIT_KEY_GENERATOR_KEY, [context.getHandler(), context.getClass()]);

    // Generate rate limit key
    const key = this.generateKey(request, action, config, customKeyGenerator);

    // Check if rate limited
    const isLimited = await this.rateGuardService.isRateLimited(key, config);
    if (isLimited) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            config.message || 'Too many requests, please try again later',
          error: 'Too Many Requests',
          retryAfter: config.blockSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment counter
    await this.rateGuardService.increment(key, config);

    return true;
  }

  /**
   * Generate rate limit key
   *
   * @param request - Request object
   * @param action - Rate limit action
   * @param config - Rate limit configuration
   * @param customKeyGenerator - Custom key generator function
   * @returns Generated key
   */
  private generateKey(
    request: FastifyRequest,
    action: RateLimitAction,
    config: RateGuardOptions,
    customKeyGenerator?: (req: any) => string,
  ): string {
    // Use custom key generator if provided
    if (customKeyGenerator) {
      return customKeyGenerator(request);
    }

    // Use config key generator if provided
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    // Use service default key generation
    return this.rateGuardService.generateKey(request, action);
  }
}
