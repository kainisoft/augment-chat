import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import {
  UserRelationship,
  RelationshipConnection,
} from '../types/relationship.types';
import { UserType } from '../types/user.types';
import {
  CreateRelationshipInput,
  UpdateRelationshipInput,
  GetUserRelationshipsInput,
} from '../types/relationship-input.types';

import { CreateRelationshipCommand } from '../../application/commands/impl/create-relationship.command';
import { UpdateRelationshipCommand } from '../../application/commands/impl/update-relationship.command';
import { DeleteRelationshipCommand } from '../../application/commands/impl/delete-relationship.command';

import { GetRelationshipQuery } from '../../application/queries/impl/get-relationship.query';
import { GetUserRelationshipsQuery } from '../../application/queries/impl/get-user-relationships.query';
import { GetUserFriendsQuery } from '../../application/queries/impl/get-user-friends.query';
import { GetUserProfileQuery } from '../../application/queries/impl/get-user-profile.query';

/**
 * Relationship Resolver
 *
 * GraphQL resolver for relationship-related operations.
 */
@Resolver(() => UserRelationship)
export class RelationshipResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(RelationshipResolver.name);
  }

  /**
   * Resolve user field for relationship
   */
  @ResolveField('user', () => UserType)
  async getUser(@Parent() relationship: UserRelationship): Promise<UserType> {
    try {
      const user = await this.queryBus.execute(
        new GetUserProfileQuery(relationship.user.id),
      );
      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error resolving user for relationship: ${relationship.id}`,
        {
          source: RelationshipResolver.name,
          method: 'getUser',
          relationshipId: relationship.id,
          userId: relationship.user.id,
        },
      );
      throw error;
    }
  }

  /**
   * Resolve target field for relationship
   */
  @ResolveField('target', () => UserType)
  async getTarget(@Parent() relationship: UserRelationship): Promise<UserType> {
    try {
      const user = await this.queryBus.execute(
        new GetUserProfileQuery(relationship.target.id),
      );
      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error resolving target for relationship: ${relationship.id}`,
        {
          source: RelationshipResolver.name,
          method: 'getTarget',
          relationshipId: relationship.id,
          targetId: relationship.target.id,
        },
      );
      throw error;
    }
  }

  /**
   * Get a relationship by ID
   */
  @Query(() => UserRelationship, {
    name: 'relationship',
    description: 'Get a relationship by ID',
    nullable: true,
  })
  async getRelationship(@Args('id') id: string): Promise<UserRelationship> {
    try {
      this.loggingService.debug(
        `Getting relationship by ID: ${id}`,
        'getRelationship',
        { relationshipId: id },
      );

      const relationship = await this.queryBus.execute(
        new GetRelationshipQuery(id),
      );

      if (!relationship) {
        throw new NotFoundException(`Relationship with ID ${id} not found`);
      }

      return relationship as unknown as UserRelationship;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting relationship by ID: ${id}`,
        {
          source: RelationshipResolver.name,
          method: 'getRelationship',
          relationshipId: id,
        },
      );
      throw error;
    }
  }

  /**
   * Get relationships for a user
   */
  @Query(() => RelationshipConnection, {
    name: 'userRelationships',
    description: 'Get relationships for a user',
  })
  async getUserRelationships(
    @Args('input') input: GetUserRelationshipsInput,
  ): Promise<RelationshipConnection> {
    try {
      this.loggingService.debug(
        `Getting relationships for user: ${input.userId}`,
        'getUserRelationships',
        {
          userId: input.userId,
          type: input.type,
          limit: input.limit,
          offset: input.offset,
        },
      );

      const relationships = await this.queryBus.execute(
        new GetUserRelationshipsQuery(
          input.userId,
          input.type,
          input.limit,
          input.offset,
        ),
      );

      return {
        nodes: relationships as unknown as UserRelationship[],
        totalCount: relationships.length,
        hasMore: relationships.length === input.limit,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting relationships for user: ${input.userId}`,
        {
          source: RelationshipResolver.name,
          method: 'getUserRelationships',
          userId: input.userId,
          type: input.type,
        },
      );
      throw error;
    }
  }

  /**
   * Get friends for a user
   */
  @Query(() => RelationshipConnection, {
    name: 'userFriends',
    description: 'Get friends for a user',
  })
  async getUserFriends(
    @Args('userId') userId: string,
    @Args('limit', { nullable: true, defaultValue: 10 }) limit?: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<RelationshipConnection> {
    try {
      this.loggingService.debug(
        `Getting friends for user: ${userId}`,
        'getUserFriends',
        { userId, limit, offset },
      );

      const relationships = await this.queryBus.execute(
        new GetUserFriendsQuery(userId, limit, offset),
      );

      return {
        nodes: relationships as unknown as UserRelationship[],
        totalCount: relationships.length,
        hasMore: relationships.length === limit,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting friends for user: ${userId}`,
        {
          source: RelationshipResolver.name,
          method: 'getUserFriends',
          userId,
        },
      );
      throw error;
    }
  }

  /**
   * Create a new relationship
   */
  @Mutation(() => UserRelationship, {
    name: 'createRelationship',
    description: 'Create a new relationship',
  })
  async createRelationship(
    @Args('userId') userId: string,
    @Args('input') input: CreateRelationshipInput,
  ): Promise<UserRelationship> {
    try {
      if (userId === input.targetId) {
        throw new BadRequestException(
          'Cannot create a relationship with yourself',
        );
      }

      this.loggingService.debug(
        `Creating relationship: ${userId} -> ${input.targetId}`,
        'createRelationship',
        {
          userId,
          targetId: input.targetId,
          type: input.type,
        },
      );

      const relationshipId = await this.commandBus.execute(
        new CreateRelationshipCommand(userId, input.targetId, input.type),
      );

      // After creating the relationship, fetch it to return
      const relationship = await this.queryBus.execute(
        new GetRelationshipQuery(relationshipId),
      );

      return relationship as unknown as UserRelationship;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error creating relationship: ${userId} -> ${input.targetId}`,
        {
          source: RelationshipResolver.name,
          method: 'createRelationship',
          userId,
          targetId: input.targetId,
          type: input.type,
        },
      );
      throw error;
    }
  }

  /**
   * Update a relationship
   */
  @Mutation(() => UserRelationship, {
    name: 'updateRelationship',
    description: 'Update a relationship',
  })
  async updateRelationship(
    @Args('id') id: string,
    @Args('input') input: UpdateRelationshipInput,
  ): Promise<UserRelationship> {
    try {
      this.loggingService.debug(
        `Updating relationship: ${id} to ${input.status}`,
        'updateRelationship',
        { relationshipId: id, status: input.status },
      );

      await this.commandBus.execute(
        new UpdateRelationshipCommand(id, input.status),
      );

      // After updating the relationship, fetch it to return
      const relationship = await this.queryBus.execute(
        new GetRelationshipQuery(id),
      );

      return relationship as unknown as UserRelationship;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating relationship: ${id} to ${input.status}`,
        {
          source: RelationshipResolver.name,
          method: 'updateRelationship',
          relationshipId: id,
          status: input.status,
        },
      );
      throw error;
    }
  }

  /**
   * Delete a relationship
   */
  @Mutation(() => Boolean, {
    name: 'deleteRelationship',
    description: 'Delete a relationship',
  })
  async deleteRelationship(@Args('id') id: string): Promise<boolean> {
    try {
      this.loggingService.debug(
        `Deleting relationship: ${id}`,
        'deleteRelationship',
        { relationshipId: id },
      );

      await this.commandBus.execute(new DeleteRelationshipCommand(id));

      return true;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error deleting relationship: ${id}`,
        {
          source: RelationshipResolver.name,
          method: 'deleteRelationship',
          relationshipId: id,
        },
      );
      throw error;
    }
  }
}
