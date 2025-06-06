import { FastifyRequest } from 'fastify';

/**
 * GraphQL Context Interface
 *
 * Defines the context object available to all GraphQL resolvers.
 */
export interface GraphQLContext {
  /**
   * Fastify request object
   */
  req?: FastifyRequest;

  /**
   * WebSocket connection object (for subscriptions)
   */
  connection?: any;

  /**
   * Current authenticated user information
   */
  user?: {
    id: string;
    authId: string;
    username: string;
    roles: string[];
  };

  /**
   * Request metadata
   */
  requestId?: string;

  /**
   * Client information
   */
  clientInfo?: {
    userAgent?: string;
    ip?: string;
    origin?: string;
  };

  /**
   * Performance tracking
   */
  startTime?: number;
}
