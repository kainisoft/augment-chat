import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { createErrorMetadata } from '../../../utils/logging.utils';

import { LoginUserCommand } from '../impl/login-user.command';
import { UserLoggedInEvent } from '../../events/impl/user-logged-in.event';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Email } from '../../../domain/models/value-objects/email.value-object';
import { TokenService } from '../../../token/token.service';
import { SessionService } from '../../../session/session.service';

/**
 * Login User Command Handler
 *
 * Handles user authentication and token generation
 */
@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(LoginUserHandler.name);
  }

  async execute(command: LoginUserCommand): Promise<any> {
    try {
      const email = new Email(command.email);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await user
        .getPassword()
        .compare(command.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user is active
      if (!user.getIsActive()) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Update last login time
      user.updateLastLoginTime();
      await this.userRepository.save(user);

      const userId = user.getId().toString();

      // Create a new session
      const sessionId = await this.sessionService.createSession(
        userId,
        {
          email: user.getEmail().toString(),
          isVerified: user.getIsVerified(),
        },
        command.ip,
        command.userAgent,
      );

      // Generate tokens with session ID in payload
      const accessToken = await this.tokenService.generateAccessToken(userId, {
        sessionId,
      });

      const refreshToken = await this.tokenService.generateRefreshToken(
        userId,
        {
          sessionId,
        },
      );

      // Publish domain event
      this.eventBus.publish(
        new UserLoggedInEvent(
          userId,
          user.getEmail().toString(),
          command.ip,
          command.userAgent,
        ),
      );

      this.loggingService.debug(
        `User logged in successfully: ${email.toString()}`,
        'execute',
        { userId },
      );

      return {
        accessToken,
        refreshToken,
        userId,
        email: user.getEmail().toString(),
        sessionId,
        expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRY', 900),
      };
    } catch (error: any) {
      this.loggingService.error(
        `Login failed: ${error.message || 'Unknown error'}`,
        error.stack || '',
        'execute',
        createErrorMetadata(error, { email: command.email }),
      );
      throw error;
    }
  }
}
