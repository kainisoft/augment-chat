import { Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { ConversationDocument } from '@app/mongodb/schemas/chat.schema';
import { ChatDatabaseService } from '../../database/chat-database.service';
import { ConversationReadRepository } from '../../domain/repositories/conversation-read.repository';
import { ConversationReadModel } from '../../domain/read-models/conversation.read-model';
import { ConversationId } from '../../domain/value-objects/conversation-id.vo';
import { MessageId } from '../../domain/value-objects/message-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

/**
 * MongoDB Conversation Read Repository
 *
 * Implementation of ConversationReadRepository using MongoDB.
 */
@Injectable()
export class MongoConversationReadRepository
  implements ConversationReadRepository
{
  constructor(
    private readonly chatDatabaseService: ChatDatabaseService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MongoConversationReadRepository.name);
  }

  private get collection(): Collection<ConversationDocument> {
    return this.chatDatabaseService
      .conversationsCollection as unknown as Collection<ConversationDocument>;
  }

  async findById(id: ConversationId): Promise<ConversationReadModel | null> {
    try {
      const document = await this.collection.findOne({ _id: id.toObjectId() });
      return document ? this.mapToDomain(document) : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding conversation by ID: ${id.toString()}`,
        {
          source: MongoConversationReadRepository.name,
          method: 'findById',
          conversationId: id.toString(),
        },
      );
      throw error;
    }
  }

  async findByParticipant(
    userId: UserId,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    },
  ): Promise<ConversationReadModel[]> {
    try {
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const orderBy = options?.orderBy || 'lastMessageAt';
      const orderDirection = options?.orderDirection || 'desc';

      const documents = await this.collection
        .find({ participants: userId.toString() })
        .sort({ [orderBy]: orderDirection === 'asc' ? 1 : -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map((doc) => this.mapToDomain(doc));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding conversations by participant: ${userId.toString()}`,
        {
          source: MongoConversationReadRepository.name,
          method: 'findByParticipant',
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  async findPrivateConversation(
    participants: UserId[],
  ): Promise<ConversationReadModel | null> {
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
          source: MongoConversationReadRepository.name,
          method: 'findPrivateConversation',
          participants: participants.map((p) => p.toString()),
        },
      );
      throw error;
    }
  }

  async searchByName(
    query: string,
    userId: UserId,
    options?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<ConversationReadModel[]> {
    try {
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;

      const documents = await this.collection
        .find({
          participants: userId.toString(),
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
          ],
        })
        .sort({ lastMessageAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return documents.map((doc) => this.mapToDomain(doc));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error searching conversations by name: ${query}`,
        {
          source: MongoConversationReadRepository.name,
          method: 'searchByName',
          query,
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  async countByParticipant(userId: UserId): Promise<number> {
    try {
      return await this.collection.countDocuments({
        participants: userId.toString(),
      });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error counting conversations by participant: ${userId.toString()}`,
        {
          source: MongoConversationReadRepository.name,
          method: 'countByParticipant',
          userId: userId.toString(),
        },
      );
      throw error;
    }
  }

  public getEntityId(entity: ConversationReadModel): ConversationId {
    return entity.id;
  }

  public mapToPersistence(entity: ConversationReadModel): ConversationDocument {
    return {
      _id: entity.id.toObjectId(),
      type: entity.type,
      participants: entity.participants.map((p) => p.toString()),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      name: entity.name,
      description: entity.description,
      avatar: entity.avatar,
      lastMessageAt: entity.lastMessageAt,
      lastMessageId: entity.lastMessageId?.toObjectId(),
    };
  }

  public mapToDomain(document: ConversationDocument): ConversationReadModel {
    return new ConversationReadModel(
      new ConversationId(document._id!),
      document.type,
      document.participants.map((p) => new UserId(p)),
      document.createdAt,
      document.updatedAt,
      document.name,
      document.description,
      document.avatar,
      document.lastMessageAt,
      document.lastMessageId
        ? new MessageId(document.lastMessageId)
        : undefined,
    );
  }
}
