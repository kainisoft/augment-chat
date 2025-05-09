import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { RedisSessionStore } from './redis-session.store';
import { SessionEncryptionService } from './session-encryption.service';
import { SessionOptions, defaultSessionOptions } from './session.interfaces';
import { SESSION_OPTIONS } from './session.constants';

/**
 * Session module options
 */
export interface SessionModuleOptions extends SessionOptions {
  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;
}

/**
 * Session Module
 *
 * This module provides session management functionality using Redis.
 */
@Module({})
export class SessionModule {
  /**
   * Register the session module
   * @param options Session module options
   * @returns Dynamic module
   */
  static register(options: SessionModuleOptions = {}): DynamicModule {
    const sessionOptionsProvider: Provider = {
      provide: SESSION_OPTIONS,
      useValue: { ...defaultSessionOptions, ...options },
    };

    return {
      module: SessionModule,
      providers: [
        sessionOptionsProvider,
        SessionEncryptionService,
        {
          provide: RedisSessionStore,
          useFactory: (
            redisService: RedisService,
            encryptionService: SessionEncryptionService,
            options: SessionOptions,
          ) => {
            return new RedisSessionStore(
              redisService,
              encryptionService,
              options,
            );
          },
          inject: [RedisService, SessionEncryptionService, SESSION_OPTIONS],
        },
      ],
      exports: [RedisSessionStore],
      global: options.isGlobal,
    };
  }
}
