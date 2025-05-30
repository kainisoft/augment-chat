import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { Email } from '@app/domain';
import { RegisterUserCommand } from '../impl/register-user.command';
import { UserRegisteredEvent } from '../../events/impl/user-registered.event';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/models/user.entity';
import { Password } from '../../../domain/models/value-objects/password.value-object';
import { TokenService } from '../../../token/token.service';
import { SessionService } from '../../../session/session.service';

/**
 * Register User Command Handler
 *
 * Handles the registration of a new user
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(RegisterUserHandler.name);
  }

  async execute(command: RegisterUserCommand): Promise<any> {
    try {
      const email = new Email(command.email);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create password object and hash it
      const password = new Password(command.password);
      const hashedPassword = await password.hash();

      // Create and save new user
      const user = new User({
        email,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      // Generate tokens and create session
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
        new UserRegisteredEvent(userId, user.getEmail().toString()),
      );

      this.loggingService.debug(
        `User registered successfully: ${email.toString()}`,
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
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Registration failed', {
        source: RegisterUserHandler.name,
        method: 'execute',
        email: command.email,
      });

      throw error;
    }
  }
}
