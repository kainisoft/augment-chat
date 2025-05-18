import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserId } from '@app/domain';

import { CreateUserCommand } from '../impl/create-user.command';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/models/user.entity';
import {
  Username,
  DisplayName,
  AuthId,
  UserStatus,
} from '../../../domain/models/value-objects';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';
import { UsernameAlreadyExistsError } from '../../../domain/errors/user.error';
import { UserCacheService } from '../../../cache/user-cache.service';

/**
 * Create User Command Handler
 *
 * Handles the creation of a new user profile
 */
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly userCacheService: UserCacheService,
  ) {
    this.loggingService.setContext(CreateUserHandler.name);
  }

  async execute(command: CreateUserCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Creating user with authId: ${command.authId}`,
        'execute',
        { authId: command.authId, username: command.username },
      );

      // Check if username already exists
      const username = new Username(command.username);
      const usernameExists = await this.userRepository.usernameExists(username);
      if (usernameExists) {
        throw new UsernameAlreadyExistsError(command.username);
      }

      // Create user entity
      const user = new User({
        authId: new AuthId(command.authId),
        username: username,
        displayName: new DisplayName(command.displayName || command.username),
      });

      // Save user to database
      await this.userRepository.save(user);

      // For a new user, we don't need to invalidate any existing cache entries
      // But we might need to invalidate search results if they contain username searches
      await this.userCacheService.invalidateSearchResults(
        user.getUsername().toString(),
      );

      this.loggingService.debug(
        `Invalidated search cache for new user with username: ${user.getUsername().toString()}`,
        'execute',
        {
          userId: user.getId().toString(),
          username: user.getUsername().toString(),
        },
      );

      // Publish domain event
      this.eventBus.publish(
        new UserCreatedEvent(
          user.getId().toString(),
          user.getAuthId().toString(),
          user.getUsername().toString(),
        ),
      );

      this.loggingService.debug(
        `User created successfully: ${user.getId().toString()}`,
        'execute',
        {
          userId: user.getId().toString(),
          authId: user.getAuthId().toString(),
          username: user.getUsername().toString(),
        },
      );
    } catch (error) {
      // Handle specific errors
      if (error instanceof UsernameAlreadyExistsError) {
        throw new ConflictException(error.message);
      }

      // Log error
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to create user',
        {
          source: CreateUserHandler.name,
          method: 'execute',
          authId: command.authId,
          username: command.username,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}
