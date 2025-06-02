import { Resolver, ResolveReference } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserType } from '../types/user.types';
import { GetUserProfileQuery } from '../../application/queries/impl/get-user-profile.query';

/**
 * Entity Resolver for Apollo Federation
 *
 * This resolver handles entity resolution for federated GraphQL queries.
 * It provides reference resolvers that allow the API Gateway to resolve
 * entities by their key fields when combining data from multiple services.
 *
 * The resolver implements the Apollo Federation specification for entity
 * resolution, enabling cross-service queries and data composition.
 */
@Resolver(() => UserType)
export class EntityResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(EntityResolver.name);
  }

  /**
   * Resolve User entity by reference
   *
   * This method is called by Apollo Federation when resolving User entities
   * from other services. It takes a reference object containing the key fields
   * and returns the complete User entity.
   *
   * @param reference - Object containing the key fields (id) for the User
   * @returns Promise<UserType> - The complete User entity
   * @throws Error if the user cannot be found or retrieved
   */
  @ResolveReference()
  async resolveReference(reference: { id: string }): Promise<UserType> {
    try {
      this.loggingService.debug(
        `Resolving User entity reference for ID: ${reference.id}`,
        'resolveUserReference',
        { userId: reference.id },
      );

      const user = await this.queryBus.execute(
        new GetUserProfileQuery(reference.id),
      );

      if (!user) {
        throw new Error(`User with ID ${reference.id} not found`);
      }

      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error resolving User entity reference for ID: ${reference.id}`,
        {
          source: EntityResolver.name,
          method: 'resolveUserReference',
          userId: reference.id,
        },
      );
      throw error;
    }
  }
}
