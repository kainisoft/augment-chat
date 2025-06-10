import { Query, Resolver } from '@nestjs/graphql';

/**
 * Basic Query Resolver
 *
 * Provides basic query functionality required by GraphQL spec.
 * The WebSocket Gateway is primarily for subscriptions, but GraphQL
 * requires at least one query to be defined.
 */
@Resolver()
export class QueryResolver {
  /**
   * Health check query
   */
  @Query(() => String)
  health(): string {
    return 'WebSocket Gateway is healthy';
  }
}
