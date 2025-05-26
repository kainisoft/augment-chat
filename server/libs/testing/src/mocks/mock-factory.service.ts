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
  createMockPaginationMeta(overrides: Partial<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> = {}) {
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
}
