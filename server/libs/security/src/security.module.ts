import { DynamicModule, Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { AuthGuardOptions } from './interfaces/';
import { AUTH_GUARD_OPTIONS, RATE_GUARD_OPTIONS } from './constants';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationGuard } from './guards/authentication.guard';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthGuardService,
  RateGuardService,
  UserContextService,
} from './services';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RateGuardOptions } from './interfaces';
import { RateLimitGuard } from './guards';

/**
 * Security Module
 *
 * Provides shared security utilities, guards, and patterns
 * for consistent security implementation across all microservices.
 *
 * This module includes:
 * - Rate limiting utilities and guards
 * - Security decorators and metadata
 * - Common security patterns and helpers
 * - Input sanitization utilities
 * - Security validation patterns
 * - Lazy-loaded heavy security operations
 * - Performance-optimized security utilities
 */
@Module({})
export class SecurityModule {
  static registerRateGuard(options: RateGuardOptions): DynamicModule {
    return {
      module: SecurityModule,
      providers: [
        {
          provide: RATE_GUARD_OPTIONS,
          useValue: options,
        },
        {
          provide: APP_GUARD,
          useClass: RateLimitGuard,
        },
        RateGuardService,
        RateLimitGuard,
      ],
      imports: [
        RedisModule.registerDefault({
          keyPrefix: 'security:rate-guard:',
        }),
      ],
      exports: [RateGuardService, RateLimitGuard],
    };
  }

  static registerAuthGuard(options: AuthGuardOptions): DynamicModule {
    return {
      module: SecurityModule,
      providers: [
        {
          provide: AUTH_GUARD_OPTIONS,
          useValue: options,
        },
        {
          provide: APP_GUARD,
          useClass: AuthenticationGuard,
        },
        AuthGuardService,
        UserContextService,
        AccessTokenGuard,
        AuthenticationGuard,
      ],
      imports: [
        JwtModule.register(options.jwtModuleOptions),
        RedisModule.registerDefault({
          keyPrefix: 'security:auth-guard:',
        }),
      ],
      global: options.isGlobal,
      exports: [AuthGuardService, UserContextService],
    };
  }

  static register(
    options: AuthGuardOptions,
    rateGuardOptions: RateGuardOptions,
  ): DynamicModule {
    return {
      module: SecurityModule,
      providers: [
        {
          provide: AUTH_GUARD_OPTIONS,
          useValue: options,
        },
        {
          provide: RATE_GUARD_OPTIONS,
          useValue: rateGuardOptions,
        },
        {
          provide: APP_GUARD,
          useClass: AuthenticationGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RateLimitGuard,
        },
        AuthGuardService,
        RateGuardService,
        UserContextService,
        AccessTokenGuard,
        AuthenticationGuard,
        RateLimitGuard,
      ],
      imports: [
        JwtModule.register(options.jwtModuleOptions),
        RedisModule.registerDefault({
          keyPrefix: 'security:',
        }),
      ],
      exports: [AuthGuardService, RateGuardService, UserContextService],
      global: options.isGlobal,
    };
  }
}
