import { Injectable } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TestSetupService } from './test-setup.service';
import { MockFactoryService } from '../mocks/mock-factory.service';

/**
 * Controller Test Builder
 *
 * Provides standardized test setup patterns specifically for controller testing
 * across all microservices.
 */
@Injectable()
export class ControllerTestBuilder {
  constructor(
    private readonly testSetup: TestSetupService,
    private readonly mockFactory: MockFactoryService,
  ) {}

  /**
   * Create a test module for auth controller testing
   *
   * @param controllerClass - The controller class to test
   * @param overrides - Optional service mock overrides
   * @returns Promise<TestingModule>
   */
  async createAuthControllerTestModule(
    controllerClass: any,
    overrides: {
      authService?: any;
      loggingService?: any;
      guards?: { guard: any; mockValue?: any }[];
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      {
        provide: 'AuthService',
        useValue: overrides.authService || this.mockFactory.createMockAuthService(),
      },
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
    ];

    return this.testSetup.createTestModule({
      controllers: [controllerClass],
      providers,
      guards: overrides.guards,
    });
  }

  /**
   * Create a test module for user service controller testing
   *
   * @param controllerClass - The controller class to test
   * @param overrides - Optional service mock overrides
   * @returns Promise<TestingModule>
   */
  async createUserControllerTestModule(
    controllerClass: any,
    overrides: {
      userServiceService?: any;
      loggingService?: any;
      guards?: { guard: any; mockValue?: any }[];
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      {
        provide: 'UserServiceService',
        useValue: overrides.userServiceService || this.mockFactory.createMockUserServiceService(),
      },
      {
        provide: 'LoggingService',
        useValue: overrides.loggingService || this.mockFactory.createMockLoggingService(),
      },
    ];

    return this.testSetup.createTestModule({
      controllers: [controllerClass],
      providers,
      guards: overrides.guards,
    });
  }

  /**
   * Create a test module for health controller testing
   *
   * @param controllerClass - The health controller class to test
   * @param healthServiceClass - The health service class
   * @param serviceName - Name of the service ('auth-service' | 'user-service')
   * @param overrides - Optional service mock overrides
   * @returns Promise<TestingModule>
   */
  async createHealthControllerTestModule(
    controllerClass: any,
    healthServiceClass: any,
    serviceName: 'auth-service' | 'user-service',
    overrides: {
      loggingService?: any;
      databaseService?: any;
      redisHealthIndicator?: any;
      errorLoggerService?: any;
    } = {},
  ): Promise<TestingModule> {
    const providers = [
      healthServiceClass,
      ...this.testSetup.createHealthServiceProviders(serviceName, overrides),
    ];

    return this.testSetup.createTestModule({
      controllers: [controllerClass],
      providers,
    });
  }

  /**
   * Create a complete test setup for auth controller with common test data
   *
   * @param controllerClass - The controller class to test
   * @param overrides - Optional overrides for services and test data
   * @returns Complete test setup object
   */
  async createAuthControllerTestSetup(
    controllerClass: any,
    overrides: {
      authService?: any;
      loggingService?: any;
      guards?: { guard: any; mockValue?: any }[];
      testData?: any;
    } = {},
  ) {
    const module = await this.createAuthControllerTestModule(controllerClass, overrides);
    const controller = module.get(controllerClass);
    const authService = module.get('AuthService');
    const loggingService = module.get('LoggingService');

    const testData = this.testSetup.createTestAuthData(overrides.testData);
    const mockRequest = this.testSetup.createTestRequest();
    const mockResponse = this.testSetup.createTestResponse();

    return {
      module,
      controller,
      authService,
      loggingService,
      testData,
      mockRequest,
      mockResponse,
    };
  }

  /**
   * Create a complete test setup for user controller with common test data
   *
   * @param controllerClass - The controller class to test
   * @param overrides - Optional overrides for services and test data
   * @returns Complete test setup object
   */
  async createUserControllerTestSetup(
    controllerClass: any,
    overrides: {
      userServiceService?: any;
      loggingService?: any;
      guards?: { guard: any; mockValue?: any }[];
      testData?: any;
    } = {},
  ) {
    const module = await this.createUserControllerTestModule(controllerClass, overrides);
    const controller = module.get(controllerClass);
    const userServiceService = module.get('UserServiceService');
    const loggingService = module.get('LoggingService');

    const mockRequest = this.testSetup.createTestRequest();
    const mockResponse = this.testSetup.createTestResponse();

    return {
      module,
      controller,
      userServiceService,
      loggingService,
      mockRequest,
      mockResponse,
    };
  }

  /**
   * Create a complete test setup for health controller with common test data
   *
   * @param controllerClass - The health controller class to test
   * @param healthServiceClass - The health service class
   * @param serviceName - Name of the service
   * @param overrides - Optional overrides for services and test data
   * @returns Complete test setup object
   */
  async createHealthControllerTestSetup(
    controllerClass: any,
    healthServiceClass: any,
    serviceName: 'auth-service' | 'user-service',
    overrides: {
      loggingService?: any;
      databaseService?: any;
      redisHealthIndicator?: any;
      errorLoggerService?: any;
      testData?: any;
    } = {},
  ) {
    const module = await this.createHealthControllerTestModule(
      controllerClass,
      healthServiceClass,
      serviceName,
      overrides,
    );

    const controller = module.get(controllerClass);
    const healthService = module.get(healthServiceClass);
    const loggingService = module.get('LoggingService');

    const testData = this.testSetup.createTestHealthData(serviceName, overrides.testData);

    return {
      module,
      controller,
      healthService,
      loggingService,
      testData,
    };
  }

  /**
   * Create common guard overrides for auth controllers
   *
   * @param guards - Array of guard classes to override
   * @returns Array of guard override configurations
   */
  createAuthGuardOverrides(guards: any[] = []) {
    return guards.map((guard) => ({
      guard,
      mockValue: { canActivate: () => true },
    }));
  }

  /**
   * Create test expectations helper for controller responses
   *
   * @param response - The response to validate
   * @param expectedProperties - Properties that should exist in the response
   * @returns Validation helper object
   */
  createResponseValidator(response: any, expectedProperties: string[] = []) {
    return {
      expectToHaveProperties: () => {
        expectedProperties.forEach((prop) => {
          expect(response).toHaveProperty(prop);
        });
      },
      expectToEqual: (expected: any) => {
        expect(response).toEqual(expected);
      },
      expectToMatchObject: (expected: any) => {
        expect(response).toMatchObject(expected);
      },
    };
  }
}
