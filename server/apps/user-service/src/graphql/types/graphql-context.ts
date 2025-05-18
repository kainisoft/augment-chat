import { FastifyRequest } from 'fastify';

/**
 * GraphQL Context
 *
 * Type definition for the GraphQL context.
 */
export interface GraphQLContext {
  req?: FastifyRequest;
  connection?: any;
}
