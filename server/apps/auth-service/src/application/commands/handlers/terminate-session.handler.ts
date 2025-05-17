import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SessionService } from '../../../session/session.service';
import { TerminateSessionCommand } from '../impl/terminate-session.command';
import { TerminateSessionResponseDto } from '../../../session/dto/terminate-session.dto';
import { SessionTerminatedEvent } from '../../events/impl';

/**
 * Terminate Session Command Handler
 *
 * Terminates a specific session
 */
@CommandHandler(TerminateSessionCommand)
export class TerminateSessionHandler
  implements
    ICommandHandler<TerminateSessionCommand, TerminateSessionResponseDto>
{
  constructor(
    private readonly sessionService: SessionService,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(TerminateSessionHandler.name);
  }

  async execute(
    command: TerminateSessionCommand,
  ): Promise<TerminateSessionResponseDto> {
    try {
      const { userId, sessionId, currentSessionId } = command;

      // Check if trying to terminate current session
      if (sessionId === currentSessionId) {
        throw new ForbiddenException(
          'Cannot terminate current session. Use logout instead.',
        );
      }

      // Get the session to verify it belongs to the user
      const session = await this.sessionService.getSession(sessionId);

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (session.userId !== userId) {
        throw new ForbiddenException(
          'Cannot terminate session of another user',
        );
      }

      // Delete the session
      const deleted = await this.sessionService.deleteSession(sessionId);

      if (!deleted) {
        throw new NotFoundException('Session not found or already terminated');
      }

      // Publish domain event
      this.eventBus.publish(
        new SessionTerminatedEvent(userId, sessionId, 'terminated'),
      );

      this.loggingService.debug(
        `Session ${sessionId} terminated for user ${userId}`,
        'execute',
        { userId, sessionId },
      );

      return {
        success: true,
        terminatedCount: 1,
        message: 'Session terminated successfully',
      };
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to terminate session', {
        source: TerminateSessionHandler.name,
        method: 'execute',
        userId: command.userId,
        sessionId: command.sessionId,
      });
      throw error;
    }
  }
}
