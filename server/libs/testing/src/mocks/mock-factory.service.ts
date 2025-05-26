import { Injectable } from '@nestjs/common';
import { UserId, Email } from '@app/domain';

/**
 * Mock Factory Service
 *
 * Provides factory methods for creating mock objects and test data
 * that can be used across all microservices for consistent testing.
 */
@Injectable()
export class MockFactoryService {
  /**
   * Create a mock user ID
   *
   * @param id - Optional specific ID, otherwise generates a random UUID
   * @returns Mock UserId
   */
  createMockUserId(id?: string): UserId {
    const mockId = id || this.generateUUID();
    return new UserId(mockId);
  }

  /**
   * Create a mock email
   *
   * @param email - Optional specific email, otherwise generates a random email
   * @returns Mock Email
   */
  createMockEmail(email?: string): Email {
    const mockEmail = email || `test${Date.now()}@example.com`;
    return new Email(mockEmail);
  }

  /**
   * Create mock user data
   *
   * @param overrides - Optional overrides for specific fields
   * @returns Mock user data object
   */
  createMockUser(overrides: Partial<{
    id: string;
    email: string;
    username: string;
    displayName: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}) {
    const now = new Date();
    return {
      id: overrides.id || this.generateUUID(),
      email: overrides.email || `test${Date.now()}@example.com`,
      username: overrides.username || `testuser${Date.now()}`,
      displayName: overrides.displayName || 'Test User',
      isActive: overrides.isActive ?? true,
      isVerified: overrides.isVerified ?? true,
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
    };
  }

  /**
   * Create mock authentication data
   *
   * @param overrides - Optional overrides for specific fields
   * @returns Mock auth data object
   */
  createMockAuthData(overrides: Partial<{
    userId: string;
    email: string;
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> = {}) {
    return {
      userId: overrides.userId || this.generateUUID(),
      email: overrides.email || `test${Date.now()}@example.com`,
      sessionId: overrides.sessionId || `sess_${this.generateRandomString(32)}`,
      accessToken: overrides.accessToken || this.generateMockJWT(),
      refreshToken: overrides.refreshToken || this.generateMockJWT(),
      expiresIn: overrides.expiresIn || 900,
    };
  }

  /**
   * Create mock JWT token
   *
   * @param payload - Optional payload overrides
   * @returns Mock JWT token string
   */
  generateMockJWT(payload: Record<string, any> = {}): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const defaultPayload = {
      sub: this.generateUUID(),
      email: `test${Date.now()}@example.com`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...payload,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url');
    const signature = this.generateRandomString(43); // Mock signature

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Create mock request object
   *
   * @param overrides - Optional overrides for specific fields
   * @returns Mock request object
   */
  createMockRequest(overrides: Partial<{
    ip: string;
    user: any;
    headers: Record<string, string>;
    body: any;
    params: Record<string, string>;
    query: Record<string, string>;
  }> = {}) {
    return {
      ip: overrides.ip || '127.0.0.1',
      user: overrides.user || null,
      headers: overrides.headers || {},
      body: overrides.body || {},
      params: overrides.params || {},
      query: overrides.query || {},
      connection: {
        remoteAddress: overrides.ip || '127.0.0.1',
      },
    };
  }

  /**
   * Create mock response object
   *
   * @returns Mock response object with jest spies
   */
  createMockResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
  }

  /**
   * Create mock logging service
   *
   * @returns Mock logging service with jest spies
   */
  createMockLoggingService() {
    return {
      setContext: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      verbose: jest.fn(),
    };
  }

  /**
   * Create mock error logger service
   *
   * @returns Mock error logger service with jest spies
   */
  createMockErrorLoggerService() {
    return {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    };
  }

  /**
   * Create mock Redis service
   *
   * @returns Mock Redis service with jest spies
   */
  createMockRedisService() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      getClient: jest.fn().mockReturnValue({
        incr: jest.fn(),
        decr: jest.fn(),
      }),
    };
  }

  /**
   * Create mock repository
   *
   * @returns Mock repository with common methods
   */
  createMockRepository() {
    return {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };
  }

  /**
   * Create mock cache service
   *
   * @returns Mock cache service with jest spies
   */
  createMockCacheService() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
      has: jest.fn(),
    };
  }

  /**
   * Generate a random UUID v4
   *
   * @returns Random UUID string
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate a random string
   *
   * @param length - Length of the string
   * @returns Random string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create test data with relationships
   *
   * @param count - Number of items to create
   * @param factory - Factory function for creating items
   * @returns Array of test data
   */
  createTestDataSet<T>(count: number, factory: (index: number) => T): T[] {
    return Array.from({ length: count }, (_, index) => factory(index));
  }

  /**
   * Create mock pagination metadata
   *
   * @param overrides - Optional overrides for specific fields
   * @returns Mock pagination metadata
   */
  createMockPaginationMeta(
    overrides: Partial<{
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }> = {},
  ) {
    const page = overrides.page || 1;
    const limit = overrides.limit || 10;
    const total = overrides.total || 100;
    const totalPages = overrides.totalPages || Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: overrides.hasNext ?? page < totalPages,
      hasPrev: overrides.hasPrev ?? page > 1,
    };
  }

  /**
   * Create mock ConfigService
   *
   * @param overrides - Optional configuration overrides
   * @returns Mock ConfigService with jest spies
   */
  createMockConfigService(overrides: Record<string, any> = {}) {
    return {
      get: jest.fn().mockImplementation((key: string) => {
        return overrides[key] ?? 900; // Default value for auth service
      }),
    };
  }

  /**
   * Create mock TokenService (Auth Service specific)
   *
   * @param overrides - Optional method overrides
   * @returns Mock TokenService with jest spies
   */
  createMockTokenService(overrides: Partial<{
    generateAccessToken: string;
    generateRefreshToken: string;
    validateToken: any;
    revokeToken: boolean;
    revokeAllUserTokens: boolean;
  }> = {}) {
    return {
      generateAccessToken: jest.fn().mockResolvedValue(overrides.generateAccessToken || 'access-token'),
      generateRefreshToken: jest.fn().mockResolvedValue(overrides.generateRefreshToken || 'refresh-token'),
      validateToken: jest.fn().mockResolvedValue(overrides.validateToken || { sub: 'user-id', sessionId: 'session-id' }),
      revokeToken: jest.fn().mockResolvedValue(overrides.revokeToken ?? true),
      revokeAllUserTokens: jest.fn().mockResolvedValue(overrides.revokeAllUserTokens ?? true),
    };
  }

  /**
   * Create mock SessionService (Auth Service specific)
   *
   * @param overrides - Optional method overrides
   * @returns Mock SessionService with jest spies
   */
  createMockSessionService(overrides: Partial<{
    createSession: string;
    getSession: any;
    updateSession: boolean;
    deleteSession: boolean;
    deleteUserSessions: boolean;
  }> = {}) {
    return {
      createSession: jest.fn().mockResolvedValue(overrides.createSession || 'session-id'),
      getSession: jest.fn().mockResolvedValue(overrides.getSession || null),
      updateSession: jest.fn().mockResolvedValue(overrides.updateSession ?? true),
      deleteSession: jest.fn().mockResolvedValue(overrides.deleteSession ?? true),
      deleteUserSessions: jest.fn().mockResolvedValue(overrides.deleteUserSessions ?? true),
    };
  }

  /**
   * Create mock AuthService (for controller tests)
   *
   * @param overrides - Optional method overrides
   * @returns Mock AuthService with jest spies
   */
  createMockAuthService(
    overrides: Partial<{
      register: any;
      login: any;
      logout: boolean;
      refreshToken: any;
      forgotPassword: boolean;
      resetPassword: boolean;
    }> = {},
  ) {
    const defaultAuthResponse = this.createMockAuthData();

    return {
      register: jest
        .fn()
        .mockResolvedValue(overrides.register || defaultAuthResponse),
      login: jest
        .fn()
        .mockResolvedValue(overrides.login || defaultAuthResponse),
      logout: jest.fn().mockResolvedValue(overrides.logout ?? true),
      refreshToken: jest
        .fn()
        .mockResolvedValue(overrides.refreshToken || defaultAuthResponse),
      forgotPassword: jest
        .fn()
        .mockResolvedValue(overrides.forgotPassword ?? true),
      resetPassword: jest
        .fn()
        .mockResolvedValue(overrides.resetPassword ?? true),
    };
  }

  /**
   * Create mock DatabaseService (for health checks)
   *
   * @param overrides - Optional method overrides
   * @returns Mock DatabaseService with jest spies
   */
  createMockDatabaseService(overrides: Partial<{
    executeResult: any;
    shouldThrow: boolean;
    errorMessage: string;
  }> = {}) {
    const mockExecute = jest.fn();

    if (overrides.shouldThrow) {
      mockExecute.mockRejectedValue(new Error(overrides.errorMessage || 'Database connection error'));
    } else {
      mockExecute.mockResolvedValue(overrides.executeResult || {
        rows: [{ connected: 1 }],
      });
    }

    return {
      drizzle: {
        db: {
          execute: mockExecute,
        },
        sql: jest.fn().mockImplementation((strings) => strings),
      },
    };
  }

  /**
   * Create mock RedisHealthIndicator
   *
   * @param overrides - Optional method overrides
   * @returns Mock RedisHealthIndicator with jest spies
   */
  createMockRedisHealthIndicator(overrides: Partial<{
    status: string;
    responseTime: number;
    shouldThrow: boolean;
    errorMessage: string;
  }> = {}) {
    const mockCheck = jest.fn();

    if (overrides.shouldThrow) {
      mockCheck.mockRejectedValue(new Error(overrides.errorMessage || 'Redis connection error'));
    } else {
      mockCheck.mockResolvedValue({
        redis: {
          status: overrides.status || 'up',
          responseTime: overrides.responseTime || 5,
        },
      });
    }

    return {
      check: mockCheck,
    };
  }

  /**
   * Create mock UserRepository (Auth Service specific)
   *
   * @param overrides - Optional method overrides
   * @returns Mock UserRepository with jest spies
   */
  createMockUserRepository(overrides: Partial<{
    findByEmail: any;
    findById: any;
    save: any;
  }> = {}) {
    return {
      findByEmail: jest.fn().mockResolvedValue(overrides.findByEmail || null),
      findById: jest.fn().mockResolvedValue(overrides.findById || null),
      save: jest.fn().mockResolvedValue(overrides.save || null),
    };
  }

  /**
   * Create mock UserServiceService (for controller tests)
   *
   * @param overrides - Optional method overrides
   * @returns Mock UserServiceService with jest spies
   */
  createMockUserServiceService(overrides: Partial<{
    getHello: string;
  }> = {}) {
    return {
      getHello: jest.fn().mockReturnValue(overrides.getHello || 'Hello World!'),
    };
  }
}
