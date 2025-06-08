import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { GetUserPresenceQuery } from '../get-user-presence.query';
import {
  PresenceTrackingService,
  UserPresenceData,
} from '../../../domain/services/presence-tracking.service';

/**
 * Get User Presence Query Handler
 *
 * Handles the GetUserPresenceQuery following the CQRS pattern.
 */
@QueryHandler(GetUserPresenceQuery)
@Injectable()
export class GetUserPresenceHandler
  implements IQueryHandler<GetUserPresenceQuery, UserPresenceData>
{
  constructor(
    private readonly presenceTrackingService: PresenceTrackingService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetUserPresenceHandler.name);
  }

  async execute(query: GetUserPresenceQuery): Promise<UserPresenceData> {
    try {
      this.loggingService.debug(
        `Getting presence for user: ${query.userId}`,
        'execute',
        {
          userId: query.userId,
          requestingUserId: query.requestingUserId,
        },
      );

      // Get presence from Redis
      const presenceData = await this.presenceTrackingService.getPresence(
        query.userId,
      );

      if (!presenceData) {
        throw new NotFoundException(
          `Presence data not found for user: ${query.userId}`,
        );
      }

      this.loggingService.debug(
        `Retrieved presence for user: ${query.userId}`,
        'execute',
        {
          userId: query.userId,
          status: presenceData.status,
        },
      );

      return presenceData;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting presence for user: ${query.userId}`,
        {
          source: GetUserPresenceHandler.name,
          method: 'execute',
          userId: query.userId,
          requestingUserId: query.requestingUserId,
        },
      );
      throw error;
    }
  }
}
