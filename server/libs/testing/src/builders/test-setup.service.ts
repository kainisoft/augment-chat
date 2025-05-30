import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MockFactoryService } from '../mocks/mock-factory.service';

/**
 * Test Setup Service
 *
 * Provides standardized test module setup patterns and utilities
 * for consistent testing across all microservices.
 */
@Injectable()
export class TestSetupService {
  constructor(private readonly mockFactory: MockFactoryService) {}

  /**
   * Create a standardized test module with common providers
   *
   * @param config - Test module configuration
   * @returns Promise<TestingModule>
   */
  async createTestModule(config: {
    controllers?: any[];
    providers?: any[];
    imports?: any[];
    guards?: { guard: any; mockValue?: any }[];
    interceptors?: { interceptor: any; mockValue?: any }[];
  }): Promise<TestingModule> {
    const moduleBuilder = Test.createTestingModule({
      controllers: config.controllers || [],
      providers: config.providers || [],
      imports: config.imports || [],
    });

    // Override guards if specified
    if (config.guards) {
      config.guards.forEach(({ guard, mockValue }) => {
        moduleBuilder.overrideGuard(guard).useValue(
          mockValue || { canActivate: () => true },
        );
      });
    }

    // Override interceptors if specified
    if (config.interceptors) {
      config.interceptors.forEach(({ interceptor, mockValue }) => {
        moduleBuilder.overrideInterceptor(interceptor).useValue(
          mockValue || { intercept: jest.fn() },
        );
      });
    }

    return moduleBuilder.compile();
  }

  /**
   * Create common provider mocks for auth service
   *
   * @param overrides - Optional provider overrides
   * @returns Array of provider configurations
   */
  createAuthServiceProviders(overrides: {
    userRepository?: any;
    tokenService?: any;
    sessionService?: any;
    configService?: any;
    loggingService?: any;
  } = {}) {
    return [
      {
        provide: 'UserRepository',
        useValue: overrides.userRepository || this.mockFactory.createMockUserRepository(),
      },
      {
        provide: 'TokenService',
        useValue: overrides.tokenService || this.mockFactory.createMockTokenService(),
      },
      {
        provide: 'SessionService',
        useValue: overrides.sessionService || this.mockFactory.createMockSessionService(),
      },
      {
        provide: 'ConfigService',
        useValue: overrides.configService || this.mockFactory.createMockConfigService(),
      },
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
    ];
  }

  /**
   * Create common provider mocks for user service
   *
   * @param overrides - Optional provider overrides
   * @returns Array of provider configurations
   */
  createUserServiceProviders(overrides: {
    userServiceService?: any;
    loggingService?: any;
    cacheService?: any;
  } = {}) {
    return [
      {
        provide: 'UserServiceService',
        useValue: overrides.userServiceService || this.mockFactory.createMockUserServiceService(),
      },
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
      {
        provide: 'CacheService',
        useValue: overrides.cacheService || this.mockFactory.createMockCacheService(),
      },
    ];
  }

  /**
   * Create common provider mocks for health controllers
   *
   * @param serviceName - Name of the service for health checks
   * @param overrides - Optional provider overrides
   * @returns Array of provider configurations
   */
  createHealthServiceProviders(
    serviceName: 'auth-service' | 'user-service',
    overrides: {
      loggingService?: any;
      databaseService?: any;
      redisHealthIndicator?: any;
      errorLoggerService?: any;
    } = {},
  ) {
    const providers = [
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
      {
        provide: 'ErrorLoggerService',
        useValue: overrides.errorLoggerService || this.mockFactory.createMockErrorLoggerService(),
      },
    ];

    // Add service-specific providers
    if (serviceName === 'auth-service') {
      providers.push(
        {
          provide: 'DatabaseService',
          useValue: overrides.databaseService || this.mockFactory.createMockDatabaseService(),
        },
        {
          provide: 'RedisHealthIndicator',
          useValue: overrides.redisHealthIndicator || this.mockFactory.createMockRedisHealthIndicator(),
        },
      );
    }

    return providers;
  }

  /**
   * Create a mock test request object with common properties
   *
   * @param overrides - Optional request property overrides
   * @returns Mock request object
   */
  createTestRequest(overrides: {
    ip?: string;
    userAgent?: string;
    authorization?: string;
    sessionId?: string;
    userId?: string;
    body?: any;
    params?: Record<string, string>;
    query?: Record<string, string>;
  } = {}) {
    return this.mockFactory.createMockRequest({
      ip: overrides.ip || '127.0.0.1',
      headers: {
        'user-agent': overrides.userAgent || 'test-agent',
        authorization: overrides.authorization || 'Bearer test-token',
        'x-session-id': overrides.sessionId || 'test-session-id',
        'x-user-id': overrides.userId || 'test-user-id',
      },
      body: overrides.body || {},
      params: overrides.params || {},
      query: overrides.query || {},
    });
  }

  /**
   * Create a mock test response object
   *
   * @returns Mock response object with jest spies
   */
  createTestResponse() {
    return this.mockFactory.createMockResponse();
  }

  /**
   * Create test data for authentication flows
   *
   * @param overrides - Optional data overrides
   * @returns Test authentication data
   */
  createTestAuthData(overrides: {
    userId?: string;
    email?: string;
    password?: string;
    sessionId?: string;
    accessToken?: string;
    refreshToken?: string;
  } = {}) {
    return {
      loginDto: {
        email: overrides.email || 'test@example.com',
        password: overrides.password || 'Password123',
      },
      registerDto: {
        email: overrides.email || 'test@example.com',
        password: overrides.password || 'Password123',
      },
      refreshTokenDto: {
        refreshToken: overrides.refreshToken || 'test-refresh-token',
      },
      authResponse: this.mockFactory.createMockAuthData({
        userId: overrides.userId,
        email: overrides.email,
        sessionId: overrides.sessionId,
        accessToken: overrides.accessToken,
        refreshToken: overrides.refreshToken,
      }),
    };
  }

  /**
   * Create test data for health check flows
   *
   * @param serviceName - Name of the service
   * @param overrides - Optional data overrides
   * @returns Test health check data
   */
  createTestHealthData(
    serviceName: string,
    overrides: {
      status?: 'ok' | 'error';
      databaseStatus?: 'ok' | 'error';
      redisStatus?: 'up' | 'down';
      errorMessage?: string;
    } = {},
  ) {
    return {
      healthResponse: {
        status: overrides.status || 'ok',
        service: serviceName,
        timestamp: new Date().toISOString(),
        components: {
          system: { status: 'ok' },
          database: {
            status: overrides.databaseStatus || 'ok',
            details: overrides.databaseStatus === 'error' 
              ? { message: overrides.errorMessage || 'Database connection failed' }
              : { responseTime: 10, connection: 'established' },
          },
        },
      },
      livenessResponse: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: serviceName,
      },
    };
  }
}
