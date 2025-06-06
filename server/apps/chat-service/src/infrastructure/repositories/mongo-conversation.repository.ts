import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { ConversationDocument } from '@app/mongodb/schemas/chat.schema';
import { ChatDatabaseService } from '../../database/chat-database.service';
import { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { Conversation } from '../../domain/entities/conversation.entity';
import { ConversationId } from '../../domain/value-objects/conversation-id.vo';
import { MessageId } from '../../domain/value-objects/message-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

/**
 * MongoDB Conversation Repository
 *
 * Implementation of ConversationRepository using MongoDB.
 */
@Injectable()
export class MongoConversationRepository implements ConversationRepository {
  constructor(
    private readonly chatDatabaseService: ChatDatabaseService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MongoConversationRepository.name);
  }

  private get collection(): Collection<ConversationDocument> {
    return this.chatDatabaseService
      .conversationsCollection as unknown as Collection<ConversationDocument>;
  }

  async save(entity: Conversation): Promise<void> {
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
        `Error saving conversation: ${entity.getId().toString()}`,
        {
          source: MongoConversationRepository.name,
          method: 'save',
          conversationId: entity.getId().toString(),
        },
      );
      throw error;
    }
  }

  async delete(id: ConversationId): Promise<void> {
    try {
      await this.collection.deleteOne({ _id: id.toObjectId() });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error deleting conversation: ${id.toString()}`,
        {
          source: MongoConversationRepository.name,
          method: 'delete',
          conversationId: id.toString(),
        },
      );
      throw error;
    }
  }

  async exists(id: ConversationId): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments({
        _id: id.toObjectId(),
      });
      return count > 0;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error checking conversation existence: ${id.toString()}`,
        {
          source: MongoConversationRepository.name,
          method: 'exists',
          conversationId: id.toString(),
        },
      );
      throw error;
    }
  }

  async findById(id: ConversationId): Promise<Conversation | null> {
    try {
      const document = await this.collection.findOne({ _id: id.toObjectId() });
      return document ? this.mapToDomain(document) : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding conversation by ID: ${id.toString()}`,
        {
          source: MongoConversationRepository.name,
          method: 'findById',
          conversationId: id.toString(),
        },
      );
      throw error;
    }
  }

  async findPrivateConversation(
    participants: UserId[],
  ): Promise<Conversation | null> {
    try {
      if (participants.length !== 2) {
        throw new Error(
          'Private conversations must have exactly 2 participants',
        );
      }

      const participantStrings = participants.map((p) => p.toString()).sort();

      const document = await this.collection.findOne({
        type: 'private',
        participants: { $all: participantStrings, $size: 2 },
      });

      return document ? this.mapToDomain(document) : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding private conversation`,
        {
          source: MongoConversationRepository.name,
          method: 'findPrivateConversation',
          participants: participants.map((p) => p.toString()),
        },
      );
      throw error;
    }
  }

  async findByParticipant(userId: UserId): Promise<Conversation[]> {
    try {
      const documents = await this.collection
        .find({ participants: userId.toString() })
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .toArray();

      return documents.map((doc) => this.mapToDomain(doc));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding conversations by participant: ${userId.toString()}`,
        {
          source: MongoConversationRepository.name,
          method: 'findByParticipant',
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  public getEntityId(entity: Conversation): ConversationId {
    return entity.getId();
  }

  public mapToPersistence(entity: Conversation): ConversationDocument {
    return {
      _id: entity.getId().toObjectId(),
      type: entity.getType(),
      participants: entity.getParticipants().map((p) => p.toString()),
      name: entity.getName(),
      description: entity.getDescription(),
      avatar: entity.getAvatar(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      lastMessageAt: entity.getLastMessageAt(),
      lastMessageId: entity.getLastMessageId()?.toObjectId(),
    };
  }

  public mapToDomain(document: ConversationDocument): Conversation {
    return new Conversation({
      id: new ConversationId(document._id!),
      type: document.type,
      participants: document.participants.map((p) => new UserId(p)),
      name: document.name,
      description: document.description,
      avatar: document.avatar,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      lastMessageAt: document.lastMessageAt,
      lastMessageId: document.lastMessageId
        ? new MessageId(document.lastMessageId)
        : undefined,
    });
  }
}
