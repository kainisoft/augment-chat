import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { ErrorLoggerService } from '@app/common/errors';

import { LogoutUserCommand } from '../impl/logout-user.command';
import { UserLoggedOutEvent } from '../../events/impl/user-logged-out.event';
import { TokenService } from '../../../token/token.service';
import { SessionService } from '../../../session/session.service';
import { TokenType } from '../../../token/enums/token-type.enum';

/**
 * Logout User Command Handler
 *
 * Handles user logout and token invalidation
 */
@CommandHandler(LogoutUserCommand)
export class LogoutUserHandler implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(LogoutUserHandler.name);
  }

  async execute(command: LogoutUserCommand): Promise<boolean> {
    try {
      // Validate the refresh token
      const payload = await this.tokenService.validateToken(
        command.refreshToken,
        TokenType.REFRESH,
      );

      if (!payload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const userId = payload.sub;
      const sessionId = payload.sessionId;

      // Revoke the refresh token
      await this.tokenService.revokeToken(command.refreshToken);

      // Delete the session
      if (sessionId) {
        await this.sessionService.deleteSession(sessionId);
      }

      // Publish domain event
      this.eventBus.publish(new UserLoggedOutEvent(userId, sessionId));

      this.loggingService.debug(`User logged out successfully`, 'execute', {
        userId,
        sessionId,
      });

      return true;
    } catch (error: any) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Logout failed', {
        source: LogoutUserHandler.name,
        method: 'execute',
        refreshToken: command.refreshToken ? '[REDACTED]' : undefined,
      });

      // Even if token validation fails, we want to return success
      // as the end result is the same - user is logged out
      return true;
    }
  }
}
