import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { COLLECTIONS, MessageDocument } from '@app/mongodb/schemas/chat.schema';
import { ChatDatabaseService } from '../../database/chat-database.service';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { Message } from '../../domain/entities/message.entity';
import { MessageId } from '../../domain/value-objects/message-id.vo';
import { ConversationId } from '../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { MessageContent } from '../../domain/value-objects/message-content.vo';
import { AbstractMongoRepository } from '@app/mongodb';

/**
 * MongoDB Message Repository
 *
 * Implementation of MessageRepository using MongoDB.
 */
@Injectable()
export class MongoMessageRepository
  extends AbstractMongoRepository<Message, MessageId, MessageDocument>
  implements MessageRepository
{
  constructor(
    private readonly chatDatabaseService: ChatDatabaseService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    super(COLLECTIONS.MESSAGES);

    this.loggingService.setContext(MongoMessageRepository.name);
  }

  protected get collection() {
    return this.chatDatabaseService.messagesCollection;
  }

  async save(entity: Message): Promise<void> {
    try {
      const document = this.mapToPersistence(entity);
      await this.collection.replaceOne(
        { _id: entity.getId().toObjectId() },
        document,
        { upsert: true },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error saving message: ${entity.getId().toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'save',
          messageId: entity.getId().toString(),
        },
      );
      throw error;
    }
  }

  async findById(id: MessageId): Promise<Message | null> {
    try {
      const document = await this.collection.findOne({ _id: id.toObjectId() });
      return document ? this.mapToDomain(document) : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding message by ID: ${id.toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'findById',
          messageId: id.toString(),
        },
      );
      throw error;
    }
  }

  async delete(id: MessageId): Promise<void> {
    try {
      await this.collection.deleteOne({ _id: id.toObjectId() });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error deleting message: ${id.toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'delete',
          messageId: id.toString(),
        },
      );
      throw error;
    }
  }

  async exists(id: MessageId): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments({
        _id: id.toObjectId(),
      });
      return count > 0;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error checking message existence: ${id.toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'exists',
          messageId: id.toString(),
        },
      );
      throw error;
    }
  }

  async findByConversationId(
    conversationId: ConversationId,
  ): Promise<Message[]> {
    try {
      const documents = await this.collection
        .find({ conversationId: conversationId.toObjectId() })
        .sort({ createdAt: -1 })
        .toArray();

      return documents.map((doc) => this.mapToDomain(doc));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding messages by conversation ID: ${conversationId.toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'findByConversationId',
          conversationId: conversationId.toString(),
        },
      );
      throw error;
    }
  }

  async markAsDelivered(messageId: MessageId, userId: UserId): Promise<void> {
    try {
      await this.collection.updateOne(
        { _id: messageId.toObjectId() },
        { $addToSet: { deliveredTo: userId.toString() } },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error marking message as delivered: ${messageId.toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'markAsDelivered',
          messageId: messageId.toString(),
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  async markAsRead(messageId: MessageId, userId: UserId): Promise<void> {
    try {
      await this.collection.updateOne(
        { _id: messageId.toObjectId() },
        {
          $addToSet: {
            readBy: userId.toString(),
            deliveredTo: userId.toString(),
          },
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error marking message as read: ${messageId.toString()}`,
        {
          source: MongoMessageRepository.name,
          method: 'markAsRead',
          messageId: messageId.toString(),
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  public getEntityId(entity: Message): MessageId {
    return entity.getId();
  }

  public mapToPersistence(entity: Message): MessageDocument {
    return {
      _id: entity.getId().toObjectId(),
      conversationId: entity.getConversationId().toObjectId(),
      senderId: entity.getSenderId().toString(),
      content: entity.getContent().toString(),
      messageType: entity.getMessageType(),
      replyTo: entity.getReplyTo()?.toObjectId(),
      attachments: entity.getAttachments(), // Keep as string array for now
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      deliveredTo: entity.getDeliveredTo().map((id) => id.toString()),
      readBy: entity.getReadBy().map((id) => id.toString()),
    };
  }

  public mapToDomain(document: MessageDocument): Message {
    return new Message({
      id: new MessageId(document._id!),
      conversationId: new ConversationId(document.conversationId),
      senderId: new UserId(document.senderId),
      content: new MessageContent(document.content),
      messageType: document.messageType,
      replyTo: document.replyTo ? new MessageId(document.replyTo) : undefined,
      attachments: document.attachments || [],
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deliveredTo: (document.deliveredTo || []).map((id) => new UserId(id)),
      readBy: (document.readBy || []).map((id) => new UserId(id)),
    });
  }
}
