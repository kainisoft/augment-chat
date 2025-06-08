import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UpdatePresenceCommand } from '../update-presence.command';
import {
  PresenceTrackingService,
  UserPresenceData,
} from '../../../domain/services/presence-tracking.service';
import {
  SubscriptionService,
  PresenceEvent,
} from '../../../graphql/services/subscription.service';

/**
 * Update Presence Command Handler
 *
 * Handles the UpdatePresenceCommand following the CQRS pattern.
 */
@CommandHandler(UpdatePresenceCommand)
@Injectable()
export class UpdatePresenceHandler
  implements ICommandHandler<UpdatePresenceCommand, UserPresenceData>
{
  constructor(
    private readonly presenceTrackingService: PresenceTrackingService,
    private readonly subscriptionService: SubscriptionService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UpdatePresenceHandler.name);
  }

  async execute(command: UpdatePresenceCommand): Promise<UserPresenceData> {
    try {
      this.loggingService.debug(
        `Updating presence for user: ${command.userId} to status: ${command.status}`,
        'execute',
        {
          userId: command.userId,
          status: command.status,
          statusMessage: command.statusMessage,
        },
      );

      // Update presence in Redis
      const presenceData = await this.presenceTrackingService.updatePresence(
        command.userId,
        command.status,
        command.statusMessage,
      );

      // Create presence event for real-time subscriptions
      const presenceEvent: PresenceEvent = {
        type: 'presence.updated',
        timestamp: Date.now(),
        userId: command.userId,
        data: {
          userId: command.userId,
          status: command.status,
          statusMessage: command.statusMessage,
          lastSeen: presenceData.lastSeen,
          timestamp: presenceData.updatedAt,
        },
      };

      // Publish presence event for real-time subscriptions
      await this.subscriptionService.publishPresenceEvent(presenceEvent);

      this.loggingService.debug(
        `Presence updated successfully for user: ${command.userId}`,
        'execute',
        {
          userId: command.userId,
          status: command.status,
        },
      );

      return presenceData;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating presence for user: ${command.userId}`,
        {
          source: UpdatePresenceHandler.name,
          method: 'execute',
          userId: command.userId,
          status: command.status,
        },
      );
      throw error;
    }
  }
}
