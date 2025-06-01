import { SetMetadata } from '@nestjs/common';
import { RateGuardOptions } from '../interfaces';

/**
 * Rate Limit Action Types
 *
 * Predefined action types for common rate limiting scenarios.
 */
export type RateLimitAction =
  | 'login'
  | 'registration'
  | 'password-reset'
  | 'api-call'
  | 'custom';

/**
 * Rate Limit Metadata Key
 */
export const RATE_LIMIT_KEY = 'rate_limit';

/**
 * Rate Limit Decorator
 *
 * Applies rate limiting to controller methods or entire controllers.
 * Can be used with predefined action types or custom configurations.
 *
 * @param action - The action type or custom configuration
 * @param customConfig - Custom configuration (when action is 'custom')
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   @RateLimit('login')
 *   async login(@Body() loginDto: LoginDto) {
 *     // Login logic
 *   }
 *
 *   @Post('register')
 *   @RateLimit('custom', {
 *     maxAttempts: 3,
 *     windowSeconds: 3600,
 *     blockSeconds: 1800,
 *     message: 'Too many registration attempts'
 *   })
 *   async register(@Body() registerDto: RegisterDto) {
 *     // Registration logic
 *   }
 * }
 * ```
 */
export function RateLimit(
  action: RateLimitAction,
  customConfig?: Partial<RateGuardOptions>,
) {
  let config: RateGuardOptions;

  switch (action) {
    case 'login':
      config = {
        maxAttempts: 5,
        windowSeconds: 900, // 15 minutes
        blockSeconds: 1800, // 30 minutes
        message: 'Too many login attempts, please try again later',
      };
      break;
    case 'registration':
      config = {
        maxAttempts: 3,
        windowSeconds: 3600, // 1 hour
        blockSeconds: 3600, // 1 hour
        message: 'Too many registration attempts, please try again later',
      };
      break;
    case 'password-reset':
      config = {
        maxAttempts: 3,
        windowSeconds: 3600, // 1 hour
        blockSeconds: 1800, // 30 minutes
        message: 'Too many password reset attempts, please try again later',
      };
      break;
    case 'api-call':
      config = {
        maxAttempts: 100,
        windowSeconds: 60, // 1 minute
        blockSeconds: 60, // 1 minute
        message: 'Rate limit exceeded, please try again later',
      };
      break;
    case 'custom':
      if (!customConfig) {
        throw new Error(
          'Custom rate limit configuration is required when using "custom" action',
        );
      }
      config = {
        maxAttempts: 10,
        windowSeconds: 60,
        blockSeconds: 60,
        message: 'Rate limit exceeded',
        ...customConfig,
      };
      break;
    default:
      throw new Error(`Unknown rate limit action: ${action}`);
  }

  // Merge with custom config if provided
  if (customConfig && action !== 'custom') {
    config = { ...config, ...customConfig };
  }

  return SetMetadata(RATE_LIMIT_KEY, { action, config });
}

/**
 * Rate Limit Skip Decorator
 *
 * Skips rate limiting for specific methods or controllers.
 * Useful for internal endpoints or health checks.
 *
 * @example
 * ```typescript
 * @Controller('health')
 * export class HealthController {
 *   @Get()
 *   @RateLimitSkip()
 *   async check() {
 *     return { status: 'ok' };
 *   }
 * }
 * ```
 */
export const RATE_LIMIT_SKIP_KEY = 'rate_limit_skip';

export function RateLimitSkip() {
  return SetMetadata(RATE_LIMIT_SKIP_KEY, true);
}

/**
 * Rate Limit Key Generator Decorator
 *
 * Provides a custom key generator for rate limiting.
 * Useful when you need custom logic for generating rate limit keys.
 *
 * @param keyGenerator - Function that generates a rate limit key from the request
 *
 * @example
 * ```typescript
 * @Controller('api')
 * export class ApiController {
 *   @Post('data')
 *   @RateLimit('api-call')
 *   @RateLimitKeyGenerator((req) => `user:${req.user.id}:api-call`)
 *   async getData(@Req() req: Request) {
 *     // API logic
 *   }
 * }
 * ```
 */
export const RATE_LIMIT_KEY_GENERATOR_KEY = 'rate_limit_key_generator';

export function RateLimitKeyGenerator(keyGenerator: (req: any) => string) {
  return SetMetadata(RATE_LIMIT_KEY_GENERATOR_KEY, keyGenerator);
}
