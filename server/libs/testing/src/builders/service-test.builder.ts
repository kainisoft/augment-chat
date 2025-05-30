import { Injectable } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TestSetupService } from './test-setup.service';
import { MockFactoryService } from '../mocks/mock-factory.service';

/**
 * Service Test Builder
 *
 * Provides standardized test setup patterns specifically for service testing
 * across all microservices.
 */
@Injectable()
export class ServiceTestBuilder {
  constructor(
    private readonly testSetup: TestSetupService,
    private readonly mockFactory: MockFactoryService,
  ) {}

  /**
   * Create a test module for auth service testing
   *
   * @param serviceClass - The service class to test
   * @param overrides - Optional dependency mock overrides
   * @returns Promise<TestingModule>
   */
  async createAuthServiceTestModule(
    serviceClass: any,
    overrides: {
      userRepository?: any;
      tokenService?: any;
      sessionService?: any;
      configService?: any;
      loggingService?: any;
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      serviceClass,
      ...this.testSetup.createAuthServiceProviders(overrides),
    ];

    return this.testSetup.createTestModule({
      providers,
    });
  }

  /**
   * Create a test module for user service testing
   *
   * @param serviceClass - The service class to test
   * @param overrides - Optional dependency mock overrides
   * @returns Promise<TestingModule>
   */
  async createUserServiceTestModule(
    serviceClass: any,
    overrides: {
      userRepository?: any;
      cacheService?: any;
      eventBus?: any;
      loggingService?: any;
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      serviceClass,
      {
        provide: 'UserRepository',
        useValue: overrides.userRepository || this.mockFactory.createMockRepository(),
      },
      {
        provide: 'CacheService',
        useValue: overrides.cacheService || this.mockFactory.createMockCacheService(),
      },
      {
        provide: 'EventBus',
        useValue: overrides.eventBus || this.createMockEventBus(),
      },
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
    ];

    return this.testSetup.createTestModule({
      providers,
    });
  }

  /**
   * Create a test module for token service testing
   *
   * @param serviceClass - The token service class to test
   * @param overrides - Optional dependency mock overrides
   * @returns Promise<TestingModule>
   */
  async createTokenServiceTestModule(
    serviceClass: any,
    overrides: {
      configService?: any;
      redisService?: any;
      loggingService?: any;
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      serviceClass,
      {
        provide: 'ConfigService',
        useValue: overrides.configService || this.mockFactory.createMockConfigService(),
      },
      {
        provide: 'RedisService',
        useValue: overrides.redisService || this.mockFactory.createMockRedisService(),
      },
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
    ];

    return this.testSetup.createTestModule({
      providers,
    });
  }

  /**
   * Create a test module for session service testing
   *
   * @param serviceClass - The session service class to test
   * @param overrides - Optional dependency mock overrides
   * @returns Promise<TestingModule>
   */
  async createSessionServiceTestModule(
    serviceClass: any,
    overrides: {
      redisService?: any;
      configService?: any;
      loggingService?: any;
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      serviceClass,
      {
        provide: 'RedisService',
        useValue: overrides.redisService || this.mockFactory.createMockRedisService(),
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

    return this.testSetup.createTestModule({
      providers,
    });
  }

  /**
   * Create a complete test setup for auth service with common test data
   *
   * @param serviceClass - The service class to test
   * @param overrides - Optional overrides for dependencies and test data
   * @returns Complete test setup object
   */
  async createAuthServiceTestSetup(
    serviceClass: any,
    overrides: {
      userRepository?: any;
      tokenService?: any;
      sessionService?: any;
      configService?: any;
      loggingService?: any;
      testData?: any;
    } = {},
  ) {
    const module = await this.createAuthServiceTestModule(serviceClass, overrides);
    const service = module.get(serviceClass);
    const userRepository = module.get('UserRepository');
    const tokenService = module.get('TokenService');
    const sessionService = module.get('SessionService');
    const configService = module.get('ConfigService');
    const loggingService = module.get('LoggingService');

    const testData = this.testSetup.createTestAuthData(overrides.testData);

    return {
      module,
      service,
      userRepository,
      tokenService,
      sessionService,
      configService,
      loggingService,
      testData,
    };
  }

  /**
   * Create a complete test setup for user service with common test data
   *
   * @param serviceClass - The service class to test
   * @param overrides - Optional overrides for dependencies and test data
   * @returns Complete test setup object
   */
  async createUserServiceTestSetup(
    serviceClass: any,
    overrides: {
      userRepository?: any;
      cacheService?: any;
      eventBus?: any;
      loggingService?: any;
      testData?: any;
    } = {},
  ) {
    const module = await this.createUserServiceTestModule(serviceClass, overrides);
    const service = module.get(serviceClass);
    const userRepository = module.get('UserRepository');
    const cacheService = module.get('CacheService');
    const eventBus = module.get('EventBus');
    const loggingService = module.get('LoggingService');

    const testUsers = this.mockFactory.createTestDataSet(5, (index) =>
      this.mockFactory.createMockUser({ id: `user-${index + 1}` }),
    );

    return {
      module,
      service,
      userRepository,
      cacheService,
      eventBus,
      loggingService,
      testUsers,
    };
  }

  /**
   * Create mock EventBus for CQRS testing
   *
   * @param overrides - Optional method overrides
   * @returns Mock EventBus with jest spies
   */
  private createMockEventBus(overrides: {
    publish?: any;
    publishAll?: any;
  } = {}) {
    return {
      publish: jest.fn().mockResolvedValue(overrides.publish || undefined),
      publishAll: jest.fn().mockResolvedValue(overrides.publishAll || undefined),
    };
  }

  /**
   * Create test expectations helper for service method calls
   *
   * @param mockObject - The mock object to validate
   * @param methodName - The method name to check
   * @returns Validation helper object
   */
  createMethodCallValidator(mockObject: any, methodName: string) {
    return {
      expectToHaveBeenCalled: () => {
        expect(mockObject[methodName]).toHaveBeenCalled();
      },
      expectToHaveBeenCalledWith: (...args: any[]) => {
        expect(mockObject[methodName]).toHaveBeenCalledWith(...args);
      },
      expectToHaveBeenCalledTimes: (times: number) => {
        expect(mockObject[methodName]).toHaveBeenCalledTimes(times);
      },
      expectNotToHaveBeenCalled: () => {
        expect(mockObject[methodName]).not.toHaveBeenCalled();
      },
    };
  }

  /**
   * Create test data for domain objects
   *
   * @param type - Type of domain object to create
   * @param overrides - Optional property overrides
   * @returns Domain object test data
   */
  createDomainTestData(
    type: 'user' | 'email' | 'userId',
    overrides: any = {},
  ) {
    switch (type) {
      case 'user':
        return this.mockFactory.createMockUser(overrides);
      case 'email':
        return this.mockFactory.createMockEmail(overrides.email);
      case 'userId':
        return this.mockFactory.createMockUserId(overrides.id);
      default:
        throw new Error(`Unknown domain type: ${type}`);
    }
  }
}
