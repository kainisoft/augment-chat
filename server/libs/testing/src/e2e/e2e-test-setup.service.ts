import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MockFactoryService } from '../mocks/mock-factory.service';

/**
 * E2E Test Setup Service
 *
 * Provides standardized E2E test setup patterns and utilities
 * for consistent end-to-end testing across all microservices.
 */
@Injectable()
export class E2ETestSetupService {
  constructor(private readonly mockFactory: MockFactoryService) {}

  /**
   * Create a standardized E2E test application
   *
   * @param moduleClass - The main module class to test
   * @param overrides - Optional module overrides
   * @returns Promise<INestApplication>
   */
  async createTestApp(
    moduleClass: any,
    overrides: {
      providers?: any[];
      imports?: any[];
      guards?: { guard: any; mockValue?: any }[];
      interceptors?: { interceptor: any; mockValue?: any }[];
    } = {},
  ): Promise<INestApplication> {
    const moduleBuilder = Test.createTestingModule({
      imports: [moduleClass, ...(overrides.imports || [])],
      providers: overrides.providers || [],
    });

    // Override guards if specified
    if (overrides.guards) {
      overrides.guards.forEach(({ guard, mockValue }) => {
        moduleBuilder.overrideGuard(guard).useValue(
          mockValue || { canActivate: () => true },
        );
      });
    }

    // Override interceptors if specified
    if (overrides.interceptors) {
      overrides.interceptors.forEach(({ interceptor, mockValue }) => {
        moduleBuilder.overrideInterceptor(interceptor).useValue(
          mockValue || { intercept: jest.fn() },
        );
      });
    }

    const moduleFixture: TestingModule = await moduleBuilder.compile();
    const app = moduleFixture.createNestApplication();
    await app.init();

    return app;
  }

  /**
   * Create a test request helper with common configurations
   *
   * @param app - The NestJS application instance
   * @returns Test request helper object
   */
  createTestRequest(app: INestApplication) {
    const agent = request(app.getHttpServer());

    return {
      get: (path: string) => agent.get(path),
      post: (path: string) => agent.post(path),
      put: (path: string) => agent.put(path),
      patch: (path: string) => agent.patch(path),
      delete: (path: string) => agent.delete(path),
      
      // Auth-specific helpers
      postWithAuth: (path: string, token: string) =>
        agent.post(path).set('Authorization', `Bearer ${token}`),
      getWithAuth: (path: string, token: string) =>
        agent.get(path).set('Authorization', `Bearer ${token}`),
      putWithAuth: (path: string, token: string) =>
        agent.put(path).set('Authorization', `Bearer ${token}`),
      deleteWithAuth: (path: string, token: string) =>
        agent.delete(path).set('Authorization', `Bearer ${token}`),

      // Session-specific helpers
      postWithSession: (path: string, sessionId: string, userId: string) =>
        agent
          .post(path)
          .set('x-session-id', sessionId)
          .set('x-user-id', userId),
      getWithSession: (path: string, sessionId: string, userId: string) =>
        agent
          .get(path)
          .set('x-session-id', sessionId)
          .set('x-user-id', userId),
    };
  }

  /**
   * Create test data for E2E authentication flows
   *
   * @param overrides - Optional data overrides
   * @returns E2E test authentication data
   */
  createE2EAuthTestData(overrides: {
    email?: string;
    password?: string;
    userId?: string;
    sessionId?: string;
  } = {}) {
    return {
      validUser: {
        email: overrides.email || 'test@example.com',
        password: overrides.password || 'Password123',
      },
      invalidUser: {
        email: 'invalid@example.com',
        password: 'WrongPassword',
      },
      registrationData: {
        email: overrides.email || 'newuser@example.com',
        password: overrides.password || 'Password123',
      },
      forgotPasswordData: {
        email: overrides.email || 'test@example.com',
      },
      resetPasswordData: {
        token: 'reset-token-123',
        password: 'NewPassword123',
      },
      refreshTokenData: {
        refreshToken: 'valid-refresh-token',
      },
      sessionData: {
        sessionId: overrides.sessionId || 'test-session-id',
        userId: overrides.userId || 'test-user-id',
      },
    };
  }

  /**
   * Create test data for E2E user service flows
   *
   * @param overrides - Optional data overrides
   * @returns E2E test user service data
   */
  createE2EUserTestData(overrides: {
    userId?: string;
    username?: string;
    displayName?: string;
  } = {}) {
    return {
      validUser: {
        id: overrides.userId || 'test-user-id',
        username: overrides.username || 'testuser',
        displayName: overrides.displayName || 'Test User',
      },
      updateUserData: {
        displayName: 'Updated Test User',
        bio: 'Updated bio',
      },
      searchQuery: {
        query: 'test',
        limit: 10,
        offset: 0,
      },
      relationshipData: {
        targetUserId: 'target-user-id',
        type: 'friend',
      },
    };
  }

  /**
   * Create test expectations helper for E2E responses
   *
   * @param response - The supertest response object
   * @returns Validation helper object
   */
  createE2EResponseValidator(response: request.Response) {
    return {
      expectStatus: (status: number) => {
        expect(response.status).toBe(status);
        return this;
      },
      expectBodyToHaveProperty: (property: string, value?: any) => {
        if (value !== undefined) {
          expect(response.body).toHaveProperty(property, value);
        } else {
          expect(response.body).toHaveProperty(property);
        }
        return this;
      },
      expectBodyToMatchObject: (expected: any) => {
        expect(response.body).toMatchObject(expected);
        return this;
      },
      expectBodyToEqual: (expected: any) => {
        expect(response.body).toEqual(expected);
        return this;
      },
      expectHeaderToExist: (header: string) => {
        expect(response.headers[header]).toBeDefined();
        return this;
      },
      expectHeaderToEqual: (header: string, value: string) => {
        expect(response.headers[header]).toBe(value);
        return this;
      },
    };
  }

  /**
   * Create database seeding utilities for E2E tests
   *
   * @param app - The NestJS application instance
   * @returns Database seeding helper object
   */
  createDatabaseSeeder(app: INestApplication) {
    return {
      seedUsers: async (count: number = 5) => {
        // This would typically interact with the actual database
        // For now, return mock data that represents seeded users
        return this.mockFactory.createTestDataSet(count, (index) =>
          this.mockFactory.createMockUser({
            id: `seeded-user-${index + 1}`,
            email: `seeded${index + 1}@example.com`,
            username: `seededuser${index + 1}`,
          }),
        );
      },
      
      seedAuthData: async (userId: string) => {
        // This would typically create auth records in the database
        return this.mockFactory.createMockAuthData({ userId });
      },
      
      cleanupDatabase: async () => {
        // This would typically clean up test data from the database
        console.log('Cleaning up E2E test database');
      },
      
      createTestTransaction: async () => {
        // This would typically create a database transaction for test isolation
        return { id: 'test-transaction' };
      },
      
      rollbackTransaction: async (transaction: any) => {
        // This would typically rollback the test transaction
        console.log('Rolling back E2E test transaction:', transaction.id);
      },
    };
  }

  /**
   * Create common test scenarios for auth endpoints
   *
   * @returns Auth test scenarios object
   */
  createAuthTestScenarios() {
    return {
      successfulLogin: {
        description: 'should login successfully with valid credentials',
        endpoint: '/auth/login',
        method: 'POST',
        expectedStatus: 200,
        expectedProperties: ['accessToken', 'refreshToken', 'userId'],
      },
      failedLogin: {
        description: 'should fail login with invalid credentials',
        endpoint: '/auth/login',
        method: 'POST',
        expectedStatus: 401,
        expectedProperties: ['message'],
      },
      successfulRegistration: {
        description: 'should register successfully with valid data',
        endpoint: '/auth/register',
        method: 'POST',
        expectedStatus: 201,
        expectedProperties: ['accessToken', 'refreshToken', 'userId'],
      },
      successfulLogout: {
        description: 'should logout successfully',
        endpoint: '/auth/logout',
        method: 'POST',
        expectedStatus: 200,
        expectedProperties: ['success'],
      },
    };
  }

  /**
   * Create common test scenarios for health endpoints
   *
   * @param serviceName - Name of the service
   * @returns Health test scenarios object
   */
  createHealthTestScenarios(serviceName: string) {
    return {
      healthCheck: {
        description: 'should return health status',
        endpoint: '/health',
        method: 'GET',
        expectedStatus: 200,
        expectedProperties: ['status', 'service', 'components'],
      },
      livenessCheck: {
        description: 'should return liveness status',
        endpoint: '/health/liveness',
        method: 'GET',
        expectedStatus: 200,
        expectedProperties: ['status', 'service', 'timestamp'],
      },
      readinessCheck: {
        description: 'should return readiness status',
        endpoint: '/health/readiness',
        method: 'GET',
        expectedStatus: 200,
        expectedProperties: ['status', 'components'],
      },
    };
  }
}
