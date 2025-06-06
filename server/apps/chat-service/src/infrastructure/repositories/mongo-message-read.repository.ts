import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { MessageDocument } from '@app/mongodb/schemas/chat.schema';
import { ChatDatabaseService } from '../../database/chat-database.service';
import { MessageReadRepository } from '../../domain/repositories/message-read.repository';
import { MessageReadModel } from '../../domain/read-models/message.read-model';
import { MessageId } from '../../domain/value-objects/message-id.vo';
import { ConversationId } from '../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

/**
 * MongoDB Message Read Repository
 *
 * Implementation of MessageReadRepository using MongoDB.
 */
@Injectable()
export class MongoMessageReadRepository implements MessageReadRepository {
  constructor(
    private readonly chatDatabaseService: ChatDatabaseService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MongoMessageReadRepository.name);
  }

  private get collection(): Collection<MessageDocument> {
    return this.chatDatabaseService
      .messagesCollection as unknown as Collection<MessageDocument>;
  }

  async findById(id: MessageId): Promise<MessageReadModel | null> {
    try {
      const document = await this.collection.findOne({ _id: id.toObjectId() });
      return document ? this.mapToDomain(document) : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding message by ID: ${id.toString()}`,
        {
          source: MongoMessageReadRepository.name,
          method: 'findById',
          messageId: id.toString(),
        },
      );
      throw error;
    }
  }

  async findByConversationId(
    conversationId: ConversationId,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    },
  ): Promise<MessageReadModel[]> {
    try {
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const orderBy = options?.orderBy || 'createdAt';
      const orderDirection = options?.orderDirection || 'desc';

      const documents = await this.collection
        .find({ conversationId: conversationId.toObjectId() })
        .sort({ [orderBy]: orderDirection === 'asc' ? 1 : -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map((doc) => this.mapToDomain(doc));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding messages by conversation ID: ${conversationId.toString()}`,
        {
          source: MongoMessageReadRepository.name,
          method: 'findByConversationId',
          conversationId: conversationId.toString(),
        },
      );
      throw error;
    }
  }

  async searchByContent(
    query: string,
    userId: UserId,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<MessageReadModel[]> {
    try {
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;

      // First, get conversations where user is participant
      const conversationsCollection =
        this.chatDatabaseService.conversationsCollection;
      const conversations = await conversationsCollection
        .find({ participants: userId.toString() })
        .toArray();

      const conversationIds = conversations.map((conv) => conv._id);

      // Search messages in those conversations
      const documents = await this.collection
        .find({
          conversationId: { $in: conversationIds },
          $text: { $search: query },
        })
        .sort({ score: { $meta: 'textScore' } })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map((doc) => this.mapToDomain(doc));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error searching messages by content: ${query}`,
        {
          source: MongoMessageReadRepository.name,
          method: 'searchByContent',
          query,
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  async countByConversationId(conversationId: ConversationId): Promise<number> {
    try {
      return await this.collection.countDocuments({
        conversationId: conversationId.toObjectId(),
      });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error counting messages by conversation ID: ${conversationId.toString()}`,
        {
          source: MongoMessageReadRepository.name,
          method: 'countByConversationId',
          conversationId: conversationId.toString(),
        },
      );
      throw error;
    }
  }

  async getUnreadCount(
    conversationId: ConversationId,
    userId: UserId,
  ): Promise<number> {
    try {
      return await this.collection.countDocuments({
        conversationId: conversationId.toObjectId(),
        readBy: { $ne: userId.toString() },
        senderId: { $ne: userId.toString() }, // Don't count own messages
      });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting unread count for conversation: ${conversationId.toString()}`,
        {
          source: MongoMessageReadRepository.name,
          method: 'getUnreadCount',
          conversationId: conversationId.toString(),
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  public getEntityId(entity: MessageReadModel): MessageId {
    return entity.id;
  }

  public mapToPersistence(entity: MessageReadModel): MessageDocument {
    return {
      _id: entity.id.toObjectId(),
      conversationId: entity.conversationId.toObjectId(),
      senderId: entity.senderId.toString(),
      content: entity.content,
      messageType: entity.messageType,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      replyTo: entity.replyTo?.toObjectId(),
      attachments: entity.attachments || [],
      deliveredTo: entity.deliveredTo?.map((id) => id.toString()) || [],
      readBy: entity.readBy?.map((id) => id.toString()) || [],
    };
  }

  public mapToDomain(document: MessageDocument): MessageReadModel {
    return new MessageReadModel(
      new MessageId(document._id!),
      new ConversationId(document.conversationId),
      new UserId(document.senderId),
      document.content,
      document.messageType,
      document.createdAt,
      document.updatedAt,
      document.replyTo ? new MessageId(document.replyTo) : undefined,
      document.attachments || [],
      (document.deliveredTo || []).map((id) => new UserId(id)),
      (document.readBy || []).map((id) => new UserId(id)),
    );
  }
}
