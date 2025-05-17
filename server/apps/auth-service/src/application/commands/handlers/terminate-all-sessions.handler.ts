import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SessionService } from '../../../session/session.service';
import { TerminateAllSessionsCommand } from '../impl/terminate-all-sessions.command';
import { TerminateSessionResponseDto } from '../../../session/dto/terminate-session.dto';
import { AllSessionsTerminatedEvent } from '../../events/impl';

/**
 * Terminate All Sessions Command Handler
 *
 * Terminates all sessions for a user except the current one
 */
@CommandHandler(TerminateAllSessionsCommand)
export class TerminateAllSessionsHandler
  implements
    ICommandHandler<TerminateAllSessionsCommand, TerminateSessionResponseDto>
{
  constructor(
    private readonly sessionService: SessionService,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(TerminateAllSessionsHandler.name);
  }

  async execute(
    command: TerminateAllSessionsCommand,
  ): Promise<TerminateSessionResponseDto> {
    try {
      const { userId, currentSessionId } = command;

      // Get all sessions for the user
      const sessions = await this.sessionService.getUserSessions(userId);

      // Filter out the current session
      const sessionsToTerminate = sessions.filter((session) => {
        const sessionId = session.userId
          ? `${session.userId}:${session.createdAt}`
          : `unknown:${session.createdAt}`;
        return sessionId !== currentSessionId;
      });

      if (sessionsToTerminate.length === 0) {
        return {
          success: true,
          terminatedCount: 0,
          message: 'No other sessions to terminate',
        };
      }

      // Terminate each session
      const terminationPromises = sessionsToTerminate.map((session) => {
        const sessionId = session.userId
          ? `${session.userId}:${session.createdAt}`
          : `unknown:${session.createdAt}`;
        return this.sessionService.deleteSession(sessionId);
      });

      await Promise.all(terminationPromises);

      // Publish domain event
      this.eventBus.publish(
        new AllSessionsTerminatedEvent(
          userId,
          currentSessionId,
          sessionsToTerminate.length,
        ),
      );

      this.loggingService.debug(
        `Terminated ${sessionsToTerminate.length} sessions for user ${userId}`,
        'execute',
        { userId, count: sessionsToTerminate.length },
      );

      return {
        success: true,
        terminatedCount: sessionsToTerminate.length,
        message: `Terminated ${sessionsToTerminate.length} sessions successfully`,
      };
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to terminate all sessions', {
        source: TerminateAllSessionsHandler.name,
        method: 'execute',
        userId: command.userId,
      });
      throw error;
    }
  }
}
