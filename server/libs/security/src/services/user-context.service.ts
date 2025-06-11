import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthGuardService } from './auth-guard.service';
import { TokenType } from '../enums/token-type.enum';

/**
 * User Context Service
 *
 * Provides utilities for extracting and managing user context
 * across HTTP requests and GraphQL operations.
 */
@Injectable()
export class UserContextService {
  constructor(private readonly authGuardService: AuthGuardService) {}

  /**
   * Extract JWT token from Authorization header
   *
   * @param request - Fastify request object
   * @returns JWT token or null if not found
   */
  extractTokenFromHeader(request: FastifyRequest): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }

  /**
   * Extract JWT token from WebSocket connection parameters
   *
   * @param connectionParams - WebSocket connection parameters
   * @returns JWT token or null if not found
   */
  extractTokenFromConnectionParams(connectionParams: any): string | null {
    if (!connectionParams) {
      return null;
    }

    // Check for token in various formats
    return (
      connectionParams.authorization?.replace('Bearer ', '') ||
      connectionParams.token ||
      connectionParams.authToken ||
      null
    );
  }

  /**
   * Validate JWT token and return user payload
   *
   * @param token - JWT token to validate
   * @returns User payload or null if invalid
   */
  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.authGuardService.validateToken(
        token,
        TokenType.ACCESS,
      );
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract user context from HTTP request
   *
   * @param request - Fastify request object
   * @returns User context or null if not authenticated
   */
  async extractUserFromRequest(
    request: FastifyRequest,
  ): Promise<JwtPayload | null> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return null;
    }

    return this.validateToken(token);
  }

  /**
   * Extract user context from WebSocket connection parameters
   *
   * @param connectionParams - WebSocket connection parameters
   * @returns User context or null if not authenticated
   */
  async extractUserFromConnectionParams(
    connectionParams: any,
  ): Promise<JwtPayload | null> {
    const token = this.extractTokenFromConnectionParams(connectionParams);
    if (!token) {
      return null;
    }

    return this.validateToken(token);
  }

  /**
   * Create GraphQL context with user information
   *
   * @param request - Fastify request object (for HTTP)
   * @param connectionParams - WebSocket connection parameters (for subscriptions)
   * @returns GraphQL context object
   */
  async createGraphQLContext(
    request?: FastifyRequest,
    connectionParams?: any,
  ): Promise<{
    req?: FastifyRequest;
    user?: JwtPayload;
    requestId: string;
    timestamp: number;
  }> {
    let user: JwtPayload | null = null;

    // Try to extract user from HTTP request first
    if (request) {
      user = await this.extractUserFromRequest(request);
    }

    // If no user from HTTP, try WebSocket connection params
    if (!user && connectionParams) {
      user = await this.extractUserFromConnectionParams(connectionParams);
    }

    return {
      req: request,
      user: user || undefined,
      requestId: this.generateRequestId(),
      timestamp: Date.now(),
    };
  }

  /**
   * Create context headers for downstream service communication
   *
   * @param user - Authenticated user payload
   * @param requestId - Request correlation ID
   * @returns Headers object for service-to-service communication
   */
  createServiceHeaders(
    user?: JwtPayload,
    requestId?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (requestId) {
      headers['x-request-id'] = requestId;
      headers['x-correlation-id'] = requestId;
    }

    if (user) {
      headers['x-user-id'] = user.sub;
      headers['x-user-session'] = user.sessionId || '';

      if (user.roles && user.roles.length > 0) {
        headers['x-user-roles'] = user.roles.join(',');
      }

      if (user.permissions && user.permissions.length > 0) {
        headers['x-user-permissions'] = user.permissions.join(',');
      }
    }

    return headers;
  }

  /**
   * Check if user has required role
   *
   * @param user - User payload
   * @param requiredRole - Required role
   * @returns True if user has the role
   */
  hasRole(user: JwtPayload | undefined, requiredRole: string): boolean {
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(requiredRole);
  }

  /**
   * Check if user has required permission
   *
   * @param user - User payload
   * @param requiredPermission - Required permission
   * @returns True if user has the permission
   */
  hasPermission(
    user: JwtPayload | undefined,
    requiredPermission: string,
  ): boolean {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(requiredPermission);
  }

  /**
   * Check if user has any of the required roles
   *
   * @param user - User payload
   * @param requiredRoles - Array of required roles
   * @returns True if user has at least one of the roles
   */
  hasAnyRole(user: JwtPayload | undefined, requiredRoles: string[]): boolean {
    if (!user || !user.roles) {
      return false;
    }
    return requiredRoles.some((role) => user.roles!.includes(role));
  }

  /**
   * Check if user has any of the required permissions
   *
   * @param user - User payload
   * @param requiredPermissions - Array of required permissions
   * @returns True if user has at least one of the permissions
   */
  hasAnyPermission(
    user: JwtPayload | undefined,
    requiredPermissions: string[],
  ): boolean {
    if (!user || !user.permissions) {
      return false;
    }
    return requiredPermissions.some((permission) =>
      user.permissions!.includes(permission),
    );
  }

  /**
   * Generate a unique request ID for correlation
   *
   * @returns Unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
