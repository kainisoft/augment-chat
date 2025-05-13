import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisSessionStore } from '@app/redis/session';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SessionData } from './interfaces/session-data.interface';

/**
 * Session Service
 *
 * Handles user session management using Redis
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly sessionStore: RedisSessionStore,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(SessionService.name);
  }

  /**
   * Create a new session
   * @param userId User ID
   * @param data Session data
   * @param ip Client IP address
   * @param userAgent Client user agent
   * @returns Session ID
   */
  async createSession(
    userId: string,
    data: Record<string, any> = {},
    ip?: string,
    userAgent?: string,
  ): Promise<string> {
    try {
      const sessionId = await this.sessionStore.create({
        userId,
        data,
        ip,
        userAgent,
      });

      this.loggingService.debug(
        `Created session for user ${userId}`,
        'createSession',
        { userId, sessionId, ip },
      );

      return sessionId;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to create session', {
        source: SessionService.name,
        method: 'createSession',
        userId,
      });
      throw error;
    }
  }

  /**
   * Get a session by ID
   * @param sessionId Session ID
   * @returns Session data
   * @throws UnauthorizedException if session is not found
   */
  async getSession(sessionId: string): Promise<SessionData> {
    try {
      const session = await this.sessionStore.get(sessionId);

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      return session;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.warning(error, 'Session retrieval failed', {
        source: SessionService.name,
        method: 'getSession',
        sessionId,
      });
      throw new UnauthorizedException('Invalid session');
    }
  }

  /**
   * Update a session
   * @param sessionId Session ID
   * @param data Session data to update
   * @returns True if session was updated
   */
  async updateSession(
    sessionId: string,
    data: Partial<SessionData>,
  ): Promise<boolean> {
    try {
      const updated = await this.sessionStore.update(sessionId, data);

      if (updated) {
        this.loggingService.debug(
          `Updated session ${sessionId}`,
          'updateSession',
          { sessionId },
        );
      } else {
        this.loggingService.warn(
          `Failed to update session ${sessionId} - not found`,
          'updateSession',
          { sessionId },
        );
      }

      return updated;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to update session', {
        source: SessionService.name,
        method: 'updateSession',
        sessionId,
      });
      return false;
    }
  }

  /**
   * Delete a session
   * @param sessionId Session ID
   * @returns True if session was deleted
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const deleted = await this.sessionStore.delete(sessionId);

      if (deleted) {
        this.loggingService.debug(
          `Deleted session ${sessionId}`,
          'deleteSession',
          { sessionId },
        );
      } else {
        this.loggingService.warn(
          `Failed to delete session ${sessionId} - not found`,
          'deleteSession',
          { sessionId },
        );
      }

      return deleted;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to delete session', {
        source: SessionService.name,
        method: 'deleteSession',
        sessionId,
      });
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   * @param userId User ID
   * @returns True if sessions were deleted
   */
  async deleteUserSessions(userId: string): Promise<boolean> {
    try {
      const deleted = await this.sessionStore.deleteByUserId(userId);

      this.loggingService.debug(
        `Deleted all sessions for user ${userId}`,
        'deleteUserSessions',
        { userId, count: deleted },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to delete user sessions', {
        source: SessionService.name,
        method: 'deleteUserSessions',
        userId,
      });
      return false;
    }
  }

  /**
   * Get all sessions for a user
   * @param userId User ID
   * @returns Array of session data
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      // Find all session IDs for the user
      const sessionIds = await this.sessionStore.findByUserId(userId);

      // Get all session data
      const sessionsPromises = sessionIds.map((id) =>
        this.sessionStore.get(id),
      );
      const sessionsWithNull = await Promise.all(sessionsPromises);

      // Filter out null sessions (they might have expired)
      const sessions = sessionsWithNull.filter(
        (session) => session !== null,
      ) as SessionData[];

      this.loggingService.debug(
        `Retrieved ${sessions.length} sessions for user ${userId}`,
        'getUserSessions',
        { userId, count: sessions.length },
      );

      return sessions;
    } catch (error: any) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to get user sessions', {
        source: SessionService.name,
        method: 'getUserSessions',
        userId,
      });
      return [];
    }
  }
}
