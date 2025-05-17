import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SessionService } from '../../../session/session.service';
import { GetUserSessionsCommand } from '../impl/get-user-sessions.command';
import { SessionListDto } from '../../../session/dto/session-list.dto';
import { SessionInfoDto } from '../../../session/dto/session-info.dto';

/**
 * Get User Sessions Command Handler
 *
 * Retrieves all active sessions for a user
 */
@CommandHandler(GetUserSessionsCommand)
export class GetUserSessionsHandler
  implements ICommandHandler<GetUserSessionsCommand, SessionListDto>
{
  constructor(
    private readonly sessionService: SessionService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetUserSessionsHandler.name);
  }

  async execute(command: GetUserSessionsCommand): Promise<SessionListDto> {
    try {
      const { userId, currentSessionId } = command;

      // Get all sessions for the user
      const sessions = await this.sessionService.getUserSessions(userId);

      // Map sessions to DTOs
      const sessionDtos = sessions.map((session) => {
        const sessionDto = new SessionInfoDto();
        sessionDto.id = session.userId
          ? `${session.userId}:${session.createdAt}`
          : `unknown:${session.createdAt}`;
        sessionDto.userId = session.userId || 'unknown';
        sessionDto.ip = session.ip;
        sessionDto.userAgent = session.userAgent;
        sessionDto.createdAt = session.createdAt;
        sessionDto.lastAccessedAt = session.lastAccessedAt;
        sessionDto.expiresAt = session.expiresAt;
        sessionDto.deviceInfo = session.deviceInfo;
        sessionDto.location = session.location;
        sessionDto.isCurrentSession = currentSessionId
          ? sessionDto.id === currentSessionId
          : false;

        return sessionDto;
      });

      this.loggingService.debug(
        `Retrieved ${sessionDtos.length} sessions for user ${userId}`,
        'execute',
        { userId, count: sessionDtos.length },
      );

      return {
        sessions: sessionDtos,
        totalCount: sessionDtos.length,
      };
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to get user sessions', {
        source: GetUserSessionsHandler.name,
        method: 'execute',
        userId: command.userId,
      });
      throw error;
    }
  }
}
