import { Injectable } from '@nestjs/common';
import {
  LoggingService,
  ErrorLoggerService,
  DatabaseLogMetadata,
} from '@app/logging';
import {
  MongodbService,
  COLLECTIONS,
  ConversationDocument,
  MessageDocument,
  AttachmentDocument,
  MessageReactionDocument,
} from '@app/mongodb';

/**
 * Chat Database Service
 *
 * Service for database operations in the Chat Service.
 * Follows the same patterns as UserDatabaseService for consistency.
 */
@Injectable()
export class ChatDatabaseService {
  constructor(
    private readonly mongodbService: MongodbService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(ChatDatabaseService.name);
  }

  /**
   * Get the MongoDB service
   */
  get mongodb(): MongodbService {
    return this.mongodbService;
  }

  /**
   * Get the messages collection
   */
  get messagesCollection() {
    return this.mongodbService.getCollection<MessageDocument>(
      COLLECTIONS.MESSAGES,
    );
  }

  /**
   * Get the conversations collection
   */
  get conversationsCollection() {
    return this.mongodbService.getCollection<ConversationDocument>(
      COLLECTIONS.CONVERSATIONS,
    );
  }

  /**
   * Get the attachments collection
   */
  get attachmentsCollection() {
    return this.mongodbService.getCollection<AttachmentDocument>(
      COLLECTIONS.ATTACHMENTS,
    );
  }

  /**
   * Get the message reactions collection
   */
  get messageReactionsCollection() {
    return this.mongodbService.getCollection<MessageReactionDocument>(
      COLLECTIONS.MESSAGE_REACTIONS,
    );
  }

  /**
   * Check database connectivity
   * @returns Object with status and details
   */
  async checkConnection(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    try {
      this.loggingService.debug(
        'Checking MongoDB connectivity',
        'checkConnection',
      );

      // Use the MongoDB service to check connectivity
      const startTime = Date.now();
      const result = await this.mongodbService.checkConnection();
      const responseTime = Date.now() - startTime;

      if (result.status === 'ok') {
        // Create type-safe database metadata
        const metadata: DatabaseLogMetadata = {
          operation: 'connectivity-check',
          table: 'system',
          duration: responseTime,
          recordCount: 1,
        };

        this.loggingService.debug<DatabaseLogMetadata>(
          'MongoDB connectivity check successful',
          'checkConnection',
          metadata,
        );

        return {
          status: 'ok',
          details: {
            responseTime,
            connection: 'established',
            database: this.mongodbService.dbName,
            serverStatus: 'connected',
          },
        };
      } else {
        throw new Error('MongoDB connectivity check failed');
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'MongoDB connectivity check failed',
        {
          source: ChatDatabaseService.name,
          method: 'checkConnection',
          errorCode: 'MONGO_CONN_ERROR',
        },
      );

      return {
        status: 'error' as const,
        details: {
          message: errorMessage,
          stack: errorStack,
          database: this.mongodbService.dbName,
        },
      };
    }
  }

  /**
   * Get database statistics
   */
  getDatabaseStats(): {
    connectionStats: any;
    databaseName: string;
  } {
    try {
      const connectionStats = this.mongodbService.getConnectionStats();

      return {
        connectionStats,
        databaseName: this.mongodbService.dbName,
      };
    } catch (error: any) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get database statistics',
        {
          source: ChatDatabaseService.name,
          method: 'getDatabaseStats',
          errorCode: 'MONGO_STATS_ERROR',
        },
      );

      throw error;
    }
  }
}
