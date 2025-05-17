import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { GetSessionHistoryQuery } from '../impl/get-session-history.query';
import { SessionHistoryDto } from '../../../session/dto/session-history.dto';
import { SessionService } from '../../../session/session.service';

/**
 * Get Session History Query Handler
 *
 * Retrieves session history for a user
 */
@QueryHandler(GetSessionHistoryQuery)
export class GetSessionHistoryHandler
  implements IQueryHandler<GetSessionHistoryQuery, SessionHistoryDto>
{
  constructor(
    private readonly sessionService: SessionService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetSessionHistoryHandler.name);
  }

  async execute(query: GetSessionHistoryQuery): Promise<SessionHistoryDto> {
    try {
      const { userId, limit = 10, offset = 0 } = query;

      // Get session history for the user
      const sessionHistory = await this.sessionService.getSessionHistory(
        userId,
        limit,
        offset,
      );

      this.loggingService.debug(
        `Retrieved ${sessionHistory.sessions.length} session history entries for user ${userId}`,
        'execute',
        { userId, count: sessionHistory.sessions.length },
      );

      return sessionHistory;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to get session history', {
        source: GetSessionHistoryHandler.name,
        method: 'execute',
        userId: query.userId,
      });
      throw error;
    }
  }
}
