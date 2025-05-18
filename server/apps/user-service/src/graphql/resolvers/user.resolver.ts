import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserType, UserSearchResult } from '../types/user.types';
import {
  CreateUserInput,
  UpdateUserProfileInput,
  UpdateUserStatusInput,
  SearchUsersInput,
} from '../types/user-input.types';

import { CreateUserCommand } from '../../application/commands/impl/create-user.command';
import { UpdateUserProfileCommand } from '../../application/commands/impl/update-user-profile.command';
import { UpdateUserStatusCommand } from '../../application/commands/impl/update-user-status.command';

import { GetUserProfileQuery } from '../../application/queries/impl/get-user-profile.query';
import { GetUserByUsernameQuery } from '../../application/queries/impl/get-user-by-username.query';
import { SearchUsersQuery } from '../../application/queries/impl/search-users.query';

/**
 * User Resolver
 *
 * GraphQL resolver for user-related operations.
 */
@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserResolver.name);
  }

  /**
   * Get a user by ID
   */
  @Query(() => UserType, {
    name: 'user',
    description: 'Get a user by ID',
    nullable: true,
  })
  async getUserById(@Args('id') id: string): Promise<UserType> {
    try {
      this.loggingService.debug(`Getting user by ID: ${id}`, 'getUserById', {
        userId: id,
      });

      const user = await this.queryBus.execute(new GetUserProfileQuery(id));
      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting user by ID: ${id}`,
        {
          source: UserResolver.name,
          method: 'getUserById',
          userId: id,
        },
      );
      throw error;
    }
  }

  /**
   * Get a user by username
   */
  @Query(() => UserType, {
    name: 'userByUsername',
    description: 'Get a user by username',
    nullable: true,
  })
  async getUserByUsername(
    @Args('username') username: string,
  ): Promise<UserType> {
    try {
      this.loggingService.debug(
        `Getting user by username: ${username}`,
        'getUserByUsername',
        { username },
      );

      const user = await this.queryBus.execute(
        new GetUserByUsernameQuery(username),
      );
      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting user by username: ${username}`,
        {
          source: UserResolver.name,
          method: 'getUserByUsername',
          username,
        },
      );
      throw error;
    }
  }

  /**
   * Search users
   */
  @Query(() => UserSearchResult, {
    name: 'searchUsers',
    description: 'Search for users by username or display name',
  })
  async searchUsers(
    @Args('input') input: SearchUsersInput,
  ): Promise<UserSearchResult> {
    try {
      this.loggingService.debug(
        `Searching users with term: ${input.searchTerm}`,
        'searchUsers',
        {
          searchTerm: input.searchTerm,
          limit: input.limit,
          offset: input.offset,
        },
      );

      const users = await this.queryBus.execute(
        new SearchUsersQuery(input.searchTerm, input.limit, input.offset),
      );

      return {
        users: users as UserType[],
        totalCount: users.length,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error searching users with term: ${input.searchTerm}`,
        {
          source: UserResolver.name,
          method: 'searchUsers',
          searchTerm: input.searchTerm,
        },
      );
      throw error;
    }
  }

  /**
   * Create a new user
   */
  @Mutation(() => UserType, {
    name: 'createUser',
    description: 'Create a new user',
  })
  async createUser(@Args('input') input: CreateUserInput): Promise<UserType> {
    try {
      this.loggingService.debug(
        `Creating user with authId: ${input.authId}`,
        'createUser',
        {
          authId: input.authId,
          username: input.username,
        },
      );

      await this.commandBus.execute(
        new CreateUserCommand(input.authId, input.username, input.displayName),
      );

      // After creating the user, fetch the user to return
      const user = await this.queryBus.execute(
        new GetUserByUsernameQuery(input.username),
      );

      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error creating user with authId: ${input.authId}`,
        {
          source: UserResolver.name,
          method: 'createUser',
          authId: input.authId,
          username: input.username,
        },
      );
      throw error;
    }
  }

  /**
   * Update a user's profile
   */
  @Mutation(() => UserType, {
    name: 'updateUserProfile',
    description: 'Update a user profile',
  })
  async updateUserProfile(
    @Args('input') input: UpdateUserProfileInput,
  ): Promise<UserType> {
    try {
      this.loggingService.debug(
        `Updating user profile: ${input.userId}`,
        'updateUserProfile',
        { userId: input.userId },
      );

      await this.commandBus.execute(
        new UpdateUserProfileCommand(
          input.userId,
          input.displayName,
          input.bio,
          input.avatarUrl,
        ),
      );

      // After updating the user, fetch the user to return
      const user = await this.queryBus.execute(
        new GetUserProfileQuery(input.userId),
      );

      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating user profile: ${input.userId}`,
        {
          source: UserResolver.name,
          method: 'updateUserProfile',
          userId: input.userId,
        },
      );
      throw error;
    }
  }

  /**
   * Update a user's status
   */
  @Mutation(() => UserType, {
    name: 'updateUserStatus',
    description: 'Update a user status',
  })
  async updateUserStatus(
    @Args('input') input: UpdateUserStatusInput,
  ): Promise<UserType> {
    try {
      this.loggingService.debug(
        `Updating user status: ${input.userId} to ${input.status}`,
        'updateUserStatus',
        { userId: input.userId, status: input.status },
      );

      await this.commandBus.execute(
        new UpdateUserStatusCommand(input.userId, input.status),
      );

      // After updating the user, fetch the user to return
      const user = await this.queryBus.execute(
        new GetUserProfileQuery(input.userId),
      );

      return user as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating user status: ${input.userId} to ${input.status}`,
        {
          source: UserResolver.name,
          method: 'updateUserStatus',
          userId: input.userId,
          status: input.status,
        },
      );
      throw error;
    }
  }
}
