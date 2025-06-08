import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  UpdatePresenceInput,
  UserPresenceResponse,
  UserPresenceInfoType,
} from '../types';
import { UpdatePresenceCommand } from '../../application/commands/update-presence.command';
import { GetUserPresenceQuery } from '../../application/queries/get-user-presence.query';
import { AuthenticatedRequest } from '@app/security';
import { UserPresenceData } from '../../domain/services/presence-tracking.service';

/**
 * Presence Resolver
 *
 * GraphQL resolver for user presence operations.
 */
@Resolver(() => UserPresenceInfoType)
@Injectable()
export class PresenceResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(PresenceResolver.name);
  }

  /**
   * Update user presence status
   */
  @Mutation(() => UserPresenceResponse, {
    name: 'updatePresence',
    description: 'Update user presence status',
  })
  async updatePresence(
    @Args('input') input: UpdatePresenceInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<UserPresenceResponse> {
    try {
      this.loggingService.debug(
        `Updating presence to status: ${input.status}`,
        'updatePresence',
        { status: input.status, statusMessage: input.statusMessage },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      const presenceData: UserPresenceData = await this.commandBus.execute(
        new UpdatePresenceCommand(
          currentUserId,
          input.status,
          input.statusMessage,
        ),
      );

      return {
        success: true,
        userId: currentUserId,
        status: presenceData.status,
        statusMessage: presenceData.statusMessage,
        lastSeen: presenceData.lastSeen,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating presence to status: ${input.status}`,
        {
          source: PresenceResolver.name,
          method: 'updatePresence',
          status: input.status,
        },
      );

      return {
        success: false,
        userId: context.user?.sub || 'anonymous-user',
        status: input.status,
        lastSeen: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user presence status
   */
  @Query(() => UserPresenceInfoType, {
    name: 'getUserPresence',
    description: 'Get user presence status',
  })
  async getUserPresence(
    @Args('userId') userId: string,
    @Context() context: AuthenticatedRequest,
  ): Promise<UserPresenceInfoType> {
    try {
      this.loggingService.debug(
        `Getting presence for user: ${userId}`,
        'getUserPresence',
        { userId },
      );

      // Get current user from context for authorization
      const requestingUserId = context.user?.sub || 'anonymous-user';

      const presenceData: UserPresenceData = await this.queryBus.execute(
        new GetUserPresenceQuery(userId, requestingUserId),
      );

      return {
        userId: presenceData.userId,
        status: presenceData.status,
        statusMessage: presenceData.statusMessage,
        lastSeen: presenceData.lastSeen,
        updatedAt: presenceData.updatedAt,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting presence for user: ${userId}`,
        {
          source: PresenceResolver.name,
          method: 'getUserPresence',
          userId,
        },
      );
      throw error;
    }
  }
}
