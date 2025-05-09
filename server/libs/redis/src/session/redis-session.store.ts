import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';
import {
  SessionData,
  SessionOptions,
  SessionStore,
  defaultSessionOptions,
} from './session.interfaces';
import { v4 as uuidv4 } from 'uuid';
import { SessionEncryptionService } from './session-encryption.service';

/**
 * Redis Session Store
 *
 * This class provides a Redis implementation of the SessionStore interface.
 */
@Injectable()
export class RedisSessionStore implements SessionStore {
  private readonly logger = new Logger(RedisSessionStore.name);
  private readonly options: SessionOptions;

  constructor(
    private readonly redisService: RedisService,
    private readonly encryptionService: SessionEncryptionService,
    options: Partial<SessionOptions> = {},
  ) {
    this.options = { ...defaultSessionOptions, ...options };

    if (this.options.encrypt && !this.options.encryptionKey) {
      throw new Error('Encryption key is required when encryption is enabled');
    }
  }

  /**
   * Create a new session
   * @param data Session data
   * @returns Promise resolving to the session ID
   */
  async create(data: Partial<SessionData>): Promise<string> {
    try {
      const sessionId = uuidv4();
      const now = Date.now();

      const sessionData: SessionData = {
        createdAt: now,
        lastAccessedAt: now,
        expiresAt: now + this.options.ttl * 1000,
        data: {},
        ...data,
      };

      const serialized = this.serializeSession(sessionData);
      const key = this.getSessionKey(sessionId);

      await this.redisService.set(key, serialized, this.options.ttl);

      // If userId is provided, create a reference for lookup
      if (sessionData.userId) {
        await this.addUserSessionReference(sessionData.userId, sessionId);
      }

      if (this.options.enableLogs) {
        this.logger.log(`Session created: ${sessionId}`);
      }

      return sessionId;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating session: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get a session by ID
   * @param id Session ID
   * @returns Promise resolving to the session data or null if not found
   */
  async get(id: string): Promise<SessionData | null> {
    try {
      const key = this.getSessionKey(id);
      const data = await this.redisService.get(key);

      if (!data) {
        return null;
      }

      const sessionData = this.deserializeSession(data);

      // Check if session has expired
      if (sessionData.expiresAt < Date.now()) {
        await this.delete(id);
        return null;
      }

      // Auto-renew session if enabled
      if (this.options.autoRenew) {
        await this.touch(id);

        // Update last accessed time in the returned data
        sessionData.lastAccessedAt = Date.now();
        sessionData.expiresAt = Date.now() + this.options.ttl * 1000;
      }

      return sessionData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting session ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Update a session
   * @param id Session ID
   * @param data Session data to update
   * @returns Promise resolving to true if the session was updated
   */
  async update(id: string, data: Partial<SessionData>): Promise<boolean> {
    try {
      const key = this.getSessionKey(id);
      const existingData = await this.redisService.get(key);

      if (!existingData) {
        return false;
      }

      const sessionData = this.deserializeSession(existingData);
      const now = Date.now();

      // Update session data
      const updatedData: SessionData = {
        ...sessionData,
        ...data,
        lastAccessedAt: now,
        expiresAt: now + this.options.ttl * 1000,
      };

      // If userId is changing, update references
      if (data.userId && data.userId !== sessionData.userId) {
        // Remove old reference if exists
        if (sessionData.userId) {
          await this.removeUserSessionReference(sessionData.userId, id);
        }

        // Add new reference
        await this.addUserSessionReference(data.userId, id);
      }

      const serialized = this.serializeSession(updatedData);
      await this.redisService.set(key, serialized, this.options.ttl);

      if (this.options.enableLogs) {
        this.logger.log(`Session updated: ${id}`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating session ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param id Session ID
   * @returns Promise resolving to true if the session was deleted
   */
  async delete(id: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(id);

      // Get session data to remove user reference
      const data = await this.redisService.get(key);

      if (data) {
        const sessionData = this.deserializeSession(data);

        // Remove user session reference if exists
        if (sessionData.userId) {
          await this.removeUserSessionReference(sessionData.userId, id);
        }
      }

      const result = await this.redisService.del(key);

      if (this.options.enableLogs && result > 0) {
        this.logger.log(`Session deleted: ${id}`);
      }

      return result > 0;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deleting session ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Touch a session to renew its expiration
   * @param id Session ID
   * @returns Promise resolving to true if the session was touched
   */
  async touch(id: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(id);
      const data = await this.redisService.get(key);

      if (!data) {
        return false;
      }

      const sessionData = this.deserializeSession(data);
      const now = Date.now();

      // Update timestamps
      sessionData.lastAccessedAt = now;
      sessionData.expiresAt = now + this.options.ttl * 1000;

      const serialized = this.serializeSession(sessionData);
      await this.redisService.set(key, serialized, this.options.ttl);

      if (this.options.enableLogs) {
        this.logger.log(`Session touched: ${id}`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error touching session ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Find sessions by user ID
   * @param userId User ID
   * @returns Promise resolving to an array of session IDs
   */
  async findByUserId(userId: string): Promise<string[]> {
    try {
      const key = this.getUserSessionsKey(userId);
      const client = this.redisService.getClient();

      // Get all session IDs for the user
      const sessionIds = await client.smembers(key);

      if (this.options.enableLogs) {
        this.logger.log(
          `Found ${sessionIds.length} sessions for user ${userId}`,
        );
      }

      return sessionIds;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error finding sessions for user ${userId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Delete all sessions for a user
   * @param userId User ID
   * @returns Promise resolving to the number of sessions deleted
   */
  async deleteByUserId(userId: string): Promise<number> {
    try {
      const sessionIds = await this.findByUserId(userId);

      if (sessionIds.length === 0) {
        return 0;
      }

      // Delete all sessions
      const promises = sessionIds.map((id) => this.delete(id));
      const results = await Promise.all(promises);

      // Count successful deletions
      const deletedCount = results.filter(Boolean).length;

      // Delete the set of user sessions
      await this.redisService.del(this.getUserSessionsKey(userId));

      if (this.options.enableLogs) {
        this.logger.log(`Deleted ${deletedCount} sessions for user ${userId}`);
      }

      return deletedCount;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error deleting sessions for user ${userId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get the Redis key for a session
   * @param id Session ID
   * @returns Redis key
   */
  private getSessionKey(id: string): string {
    return `${this.options.prefix}:${id}`;
  }

  /**
   * Get the Redis key for a user's sessions
   * @param userId User ID
   * @returns Redis key
   */
  private getUserSessionsKey(userId: string): string {
    return `${this.options.prefix}:user:${userId}`;
  }

  /**
   * Add a session reference to a user
   * @param userId User ID
   * @param sessionId Session ID
   */
  private async addUserSessionReference(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const key = this.getUserSessionsKey(userId);
    await this.redisService.getClient().sadd(key, sessionId);
  }

  /**
   * Remove a session reference from a user
   * @param userId User ID
   * @param sessionId Session ID
   */
  private async removeUserSessionReference(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const key = this.getUserSessionsKey(userId);
    await this.redisService.getClient().srem(key, sessionId);
  }

  /**
   * Serialize session data
   * @param data Session data
   * @returns Serialized session data
   */
  private serializeSession(data: SessionData): string {
    const serialized = JSON.stringify(data);

    if (this.options.encrypt) {
      return this.encryptionService.encrypt(
        serialized,
        this.options.encryptionKey,
      );
    }

    return serialized;
  }

  /**
   * Deserialize session data
   * @param data Serialized session data
   * @returns Deserialized session data
   */
  private deserializeSession(data: string): SessionData {
    let serialized = data;

    if (this.options.encrypt) {
      serialized = this.encryptionService.decrypt(
        data,
        this.options.encryptionKey,
      );
    }

    return JSON.parse(serialized) as SessionData;
  }
}
