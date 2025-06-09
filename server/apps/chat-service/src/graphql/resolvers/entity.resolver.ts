import { Resolver, ResolveReference } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { MessageType } from '../types/message.types';
import { ConversationType } from '../types/conversation.types';
import { UserType } from '../types/user.types';
import { GetMessageQuery } from '../../application/queries/get-message.query';
import { GetConversationQuery } from '../../application/queries/get-conversation.query';

/**
 * Entity Resolver for Apollo Federation
 *
 * This resolver handles entity resolution for federated GraphQL queries.
 * It provides reference resolvers that allow the API Gateway to resolve
 * entities by their key fields when combining data from multiple services.
 *
 * The resolver implements the Apollo Federation specification for entity
 * resolution, enabling cross-service queries and data composition.
 */
@Resolver(() => MessageType)
export class MessageEntityResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MessageEntityResolver.name);
  }

  /**
   * Resolve Message entity by reference
   *
   * This method is called by Apollo Federation when resolving Message entities
   * from other services. It takes a reference object containing the key fields
   * and returns the complete Message entity.
   *
   * @param reference - Object containing the key fields (id) for the Message
   * @returns Promise<MessageType> - The complete Message entity
   * @throws Error if the message cannot be found or retrieved
   */
  @ResolveReference()
  async resolveReference(reference: { id: string }): Promise<MessageType> {
    try {
      this.loggingService.debug(
        `Resolving Message entity reference for ID: ${reference.id}`,
        'resolveMessageReference',
        { messageId: reference.id },
      );

      // For federation entity resolution, we use a system user context
      // In a real implementation, you might want to create a special query for federation
      const message = await this.queryBus.execute(
        new GetMessageQuery(reference.id, 'system'),
      );

      if (!message) {
        throw new Error(`Message with ID ${reference.id} not found`);
      }

      return message as MessageType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error resolving Message entity reference for ID: ${reference.id}`,
        {
          source: MessageEntityResolver.name,
          method: 'resolveMessageReference',
          messageId: reference.id,
        },
      );
      throw error;
    }
  }
}

/**
 * Conversation Entity Resolver for Apollo Federation
 */
@Resolver(() => ConversationType)
export class ConversationEntityResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(ConversationEntityResolver.name);
  }

  /**
   * Resolve Conversation entity by reference
   *
   * This method is called by Apollo Federation when resolving Conversation entities
   * from other services. It takes a reference object containing the key fields
   * and returns the complete Conversation entity.
   *
   * @param reference - Object containing the key fields (id) for the Conversation
   * @returns Promise<ConversationType> - The complete Conversation entity
   * @throws Error if the conversation cannot be found or retrieved
   */
  @ResolveReference()
  async resolveReference(reference: { id: string }): Promise<ConversationType> {
    try {
      this.loggingService.debug(
        `Resolving Conversation entity reference for ID: ${reference.id}`,
        'resolveConversationReference',
        { conversationId: reference.id },
      );

      // For federation entity resolution, we use a system user context
      // In a real implementation, you might want to create a special query for federation
      const conversation = await this.queryBus.execute(
        new GetConversationQuery(reference.id, 'system'),
      );

      if (!conversation) {
        throw new Error(`Conversation with ID ${reference.id} not found`);
      }

      return conversation as ConversationType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error resolving Conversation entity reference for ID: ${reference.id}`,
        {
          source: ConversationEntityResolver.name,
          method: 'resolveConversationReference',
          conversationId: reference.id,
        },
      );
      throw error;
    }
  }
}

/**
 * User Entity Resolver for Apollo Federation
 *
 * This resolver handles User entity references from the User Service.
 * Since User is owned by the User Service, this resolver just provides
 * a stub that allows federation to work properly.
 */
@Resolver(() => UserType)
export class UserEntityResolver {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserEntityResolver.name);
  }

  /**
   * Resolve User entity by reference
   *
   * This is a stub resolver for User entities. The actual User data
   * is resolved by the User Service. This resolver just ensures that
   * the federation can properly reference User entities.
   *
   * @param reference - Object containing the key fields (id) for the User
   * @returns Promise<UserType> - The User entity reference
   */
  @ResolveReference()
  async resolveReference(reference: { id: string }): Promise<UserType> {
    try {
      this.loggingService.debug(
        `Resolving User entity reference for ID: ${reference.id}`,
        'resolveUserReference',
        { userId: reference.id },
      );

      // For federation, we just return the reference as-is
      // The User Service will handle the actual resolution
      return reference as UserType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error resolving User entity reference for ID: ${reference.id}`,
        {
          source: UserEntityResolver.name,
          method: 'resolveUserReference',
          userId: reference.id,
        },
      );
      throw error;
    }
  }
}
