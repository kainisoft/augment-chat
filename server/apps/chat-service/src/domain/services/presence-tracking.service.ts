import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { RedisService } from '@app/redis';
import { UserPresenceType } from '../../graphql/types';

/**
 * User Presence Data Interface
 */
export interface UserPresenceData {
  userId: string;
  status: UserPresenceType;
  statusMessage?: string;
  lastSeen: Date;
  updatedAt: Date;
}

/**
 * Presence Tracking Service
 *
 * Manages user presence status with Redis-based storage for persistence.
 */
@Injectable()
export class PresenceTrackingService {
  private readonly PRESENCE_KEY_PREFIX = 'user:presence:';
  private readonly PRESENCE_TTL = 86400; // 24 hours in seconds

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(PresenceTrackingService.name);
  }

  /**
   * Update user presence status
   */
  async updatePresence(
    userId: string,
    status: UserPresenceType,
    statusMessage?: string,
  ): Promise<UserPresenceData> {
    try {
      this.loggingService.debug(
        `Updating presence for user: ${userId} to status: ${status}`,
        'updatePresence',
        { userId, status, statusMessage },
      );

      const now = new Date();
      const presenceData: UserPresenceData = {
        userId,
        status,
        statusMessage,
        lastSeen: now,
        updatedAt: now,
      };

      const key = this.getPresenceKey(userId);
      const client = this.redisService.getClient();

      // Store presence data in Redis with TTL
      await client.setex(key, this.PRESENCE_TTL, JSON.stringify(presenceData));

      this.loggingService.debug(
        `Presence updated successfully for user: ${userId}`,
        'updatePresence',
        { userId, status },
      );

      return presenceData;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating presence for user: ${userId}`,
        {
          source: PresenceTrackingService.name,
          method: 'updatePresence',
          userId,
          status,
        },
      );
      throw error;
    }
  }

  /**
   * Get user presence status
   */
  async getPresence(userId: string): Promise<UserPresenceData | null> {
    try {
      this.loggingService.debug(
        `Getting presence for user: ${userId}`,
        'getPresence',
        { userId },
      );

      const key = this.getPresenceKey(userId);
      const client = this.redisService.getClient();

      const data = await client.get(key);
      if (!data) {
        this.loggingService.debug(
          `No presence data found for user: ${userId}`,
          'getPresence',
          { userId },
        );
        return null;
      }

      const presenceData: UserPresenceData = JSON.parse(data);

      // Convert date strings back to Date objects
      presenceData.lastSeen = new Date(presenceData.lastSeen);
      presenceData.updatedAt = new Date(presenceData.updatedAt);

      this.loggingService.debug(
        `Retrieved presence for user: ${userId}`,
        'getPresence',
        { userId, status: presenceData.status },
      );

      return presenceData;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting presence for user: ${userId}`,
        {
          source: PresenceTrackingService.name,
          method: 'getPresence',
          userId,
        },
      );
      throw error;
    }
  }

  /**
   * Update last seen timestamp for a user
   */
  async updateLastSeen(userId: string): Promise<void> {
    try {
      const existingPresence = await this.getPresence(userId);
      if (existingPresence) {
        existingPresence.lastSeen = new Date();
        existingPresence.updatedAt = new Date();

        const key = this.getPresenceKey(userId);
        const client = this.redisService.getClient();

        await client.setex(
          key,
          this.PRESENCE_TTL,
          JSON.stringify(existingPresence),
        );

        this.loggingService.debug(
          `Updated last seen for user: ${userId}`,
          'updateLastSeen',
          { userId },
        );
      }
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating last seen for user: ${userId}`,
        {
          source: PresenceTrackingService.name,
          method: 'updateLastSeen',
          userId,
        },
      );
      // Don't throw error for last seen updates to avoid disrupting other operations
    }
  }

  /**
   * Remove user presence (when user goes offline)
   */
  async removePresence(userId: string): Promise<void> {
    try {
      this.loggingService.debug(
        `Removing presence for user: ${userId}`,
        'removePresence',
        { userId },
      );

      const key = this.getPresenceKey(userId);
      const client = this.redisService.getClient();

      await client.del(key);

      this.loggingService.debug(
        `Presence removed for user: ${userId}`,
        'removePresence',
        { userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error removing presence for user: ${userId}`,
        {
          source: PresenceTrackingService.name,
          method: 'removePresence',
          userId,
        },
      );
      throw error;
    }
  }

  /**
   * Get multiple user presences
   */
  async getMultiplePresences(
    userIds: string[],
  ): Promise<Map<string, UserPresenceData>> {
    try {
      this.loggingService.debug(
        `Getting presence for ${userIds.length} users`,
        'getMultiplePresences',
        { userCount: userIds.length },
      );

      const client = this.redisService.getClient();
      const keys = userIds.map((userId) => this.getPresenceKey(userId));

      const results = await client.mget(...keys);
      const presenceMap = new Map<string, UserPresenceData>();

      for (let i = 0; i < userIds.length; i++) {
        const data = results[i];
        if (data) {
          const presenceData: UserPresenceData = JSON.parse(data);
          presenceData.lastSeen = new Date(presenceData.lastSeen);
          presenceData.updatedAt = new Date(presenceData.updatedAt);
          presenceMap.set(userIds[i], presenceData);
        }
      }

      this.loggingService.debug(
        `Retrieved presence for ${presenceMap.size} out of ${userIds.length} users`,
        'getMultiplePresences',
        { requestedCount: userIds.length, foundCount: presenceMap.size },
      );

      return presenceMap;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting multiple presences`,
        {
          source: PresenceTrackingService.name,
          method: 'getMultiplePresences',
          userCount: userIds.length,
        },
      );
      throw error;
    }
  }

  /**
   * Generate Redis key for user presence
   */
  private getPresenceKey(userId: string): string {
    return `${this.PRESENCE_KEY_PREFIX}${userId}`;
  }
}
