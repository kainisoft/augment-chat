import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { IamService, TokenType } from '@app/iam';
import { TokenPayload } from './interfaces/token-payload.interface';

/**
 * Token Service
 *
 * Handles JWT token generation, validation, and storage in Redis
 */
@Injectable()
export class TokenService {
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;
  private readonly tokenBlacklistPrefix = 'token:blacklist:';
  private readonly tokenMetadataPrefix = 'token:metadata:';

  constructor(
    private readonly iamService: IamService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(TokenService.name);

    // Get token expiry times from config
    this.accessTokenExpiry = this.configService.get<number>(
      'JWT_ACCESS_EXPIRY',
      900,
    ); // 15 minutes
    this.refreshTokenExpiry = this.configService.get<number>(
      'JWT_REFRESH_EXPIRY',
      604800,
    ); // 7 days
  }

  /**
   * Generate an access token
   * @param userId User ID
   * @param additionalData Additional data to include in the token
   * @returns Access token
   */
  async generateAccessToken(
    userId: string,
    additionalData: Record<string, any> = {},
  ): Promise<string> {
    const token = await this.iamService.generateAccessToken(
      userId,
      additionalData,
    );

    // Store token metadata in Redis
    const payload: TokenPayload = {
      sub: userId,
      type: TokenType.ACCESS,
      iat: Math.floor(Date.now() / 1000),
      ...additionalData,
    };
    await this.storeTokenMetadata(token, payload);

    this.loggingService.debug(
      `Generated access token for user ${userId}`,
      'generateAccessToken',
      { userId, tokenType: TokenType.ACCESS },
    );

    return token;
  }

  /**
   * Generate a refresh token
   * @param userId User ID
   * @param additionalData Additional data to include in the token
   * @returns Refresh token
   */
  async generateRefreshToken(
    userId: string,
    additionalData: Record<string, any> = {},
  ): Promise<string> {
    const token = await this.iamService.generateRefreshToken(
      userId,
      additionalData,
    );

    // Store token metadata in Redis
    const payload: TokenPayload = {
      sub: userId,
      type: TokenType.REFRESH,
      iat: Math.floor(Date.now() / 1000),
      ...additionalData,
    };
    await this.storeTokenMetadata(token, payload);

    this.loggingService.debug(
      `Generated refresh token for user ${userId}`,
      'generateRefreshToken',
      { userId, tokenType: TokenType.REFRESH },
    );

    return token;
  }

  /**
   * Validate a token
   * @param token Token to validate
   * @param type Expected token type
   * @returns Token payload if valid
   * @throws UnauthorizedException if token is invalid
   */
  async validateToken(token: string, type: TokenType): Promise<TokenPayload> {
    try {
      // Verify the token using IAM service
      const payload = (await this.iamService.validateToken(
        token,
        type,
      )) as TokenPayload;

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.warning(
        error instanceof Error ? error : new Error('Unknown error'),
        'Token validation failed',
        {
          source: TokenService.name,
          method: 'validateToken',
          tokenType: type,
        },
      );
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Revoke a token
   * @param token Token to revoke
   * @returns True if token was revoked
   */
  async revokeToken(token: string): Promise<boolean> {
    try {
      // Verify the token first
      const payload = (await this.iamService.validateToken(
        token,
        TokenType.ACCESS,
      )) as TokenPayload;

      // Calculate remaining time until token expiry
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = payload.exp;
      const ttl = (expiryTime || 0) - currentTime;

      if (ttl <= 0) {
        // Token already expired, no need to blacklist
        return true;
      }

      // Add token to blacklist with TTL
      const blacklistKey = `${this.tokenBlacklistPrefix}${token}`;
      await this.redisService.set(blacklistKey, '1', ttl);

      // Also revoke the token in IAM service
      await this.iamService.revokeToken(payload.sub, payload.sessionId);

      this.loggingService.debug(
        `Revoked token for user ${payload.sub}`,
        'revokeToken',
        { userId: payload.sub, tokenType: payload.type },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error('Unknown error'),
        'Failed to revoke token',
        {
          source: TokenService.name,
          method: 'revokeToken',
        },
      );
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token Token to check
   * @returns True if token is blacklisted
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistKey = `${this.tokenBlacklistPrefix}${token}`;
    const result = await this.redisService.get(blacklistKey);
    return result !== null;
  }

  /**
   * Store token metadata in Redis
   * @param token Token
   * @param payload Token payload
   */
  private async storeTokenMetadata(
    token: string,
    payload: TokenPayload,
  ): Promise<void> {
    try {
      // Calculate TTL based on token type
      const ttl =
        payload.type === 'access'
          ? this.accessTokenExpiry
          : this.refreshTokenExpiry;

      // Store token metadata
      const metadataKey = `${this.tokenMetadataPrefix}${payload.sub}:${token}`;
      await this.redisService.set(
        metadataKey,
        JSON.stringify({
          userId: payload.sub,
          tokenType: payload.type,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(payload.iat * 1000 + ttl * 1000).toISOString(),
          ...payload,
        }),
        ttl,
      );
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error('Unknown error'),
        'Failed to store token metadata',
        {
          source: TokenService.name,
          method: 'storeTokenMetadata',
          userId: payload.sub,
        },
      );
    }
  }

  /**
   * Revoke all tokens for a user
   * @param userId User ID
   * @returns True if tokens were revoked
   */
  async revokeAllUserTokens(userId: string): Promise<boolean> {
    try {
      // Get all token metadata keys for the user
      const pattern = `${this.tokenMetadataPrefix}${userId}:*`;
      const keys = await this.redisService.getClient().keys(pattern);

      if (keys.length === 0) {
        return true;
      }

      // Get all token metadata
      const pipeline = this.redisService.getClient().pipeline();
      keys.forEach((key) => pipeline.get(key));
      const results = await pipeline.exec();

      // Extract tokens and add them to blacklist
      const blacklistPipeline = this.redisService.getClient().pipeline();

      results?.forEach(([err, value], index) => {
        if (err) {
          // Use ErrorLoggerService for structured error logging
          this.errorLogger.error(err, 'Error getting token metadata', {
            source: TokenService.name,
            method: 'revokeAllUserTokens',
            userId,
          });
          return;
        }

        try {
          const metadata = JSON.parse(value as string);
          const token = keys[index].split(':').pop();
          const ttl = Math.floor(
            (new Date(metadata.expiresAt).getTime() - Date.now()) / 1000,
          );

          if (ttl > 0) {
            const blacklistKey = `${this.tokenBlacklistPrefix}${token}`;
            blacklistPipeline.set(blacklistKey, '1', 'EX', ttl);
          }
        } catch (error) {
          // Use ErrorLoggerService for structured error logging
          this.errorLogger.error(error, 'Error parsing token metadata', {
            source: TokenService.name,
            method: 'revokeAllUserTokens',
            userId,
          });
        }
      });

      await blacklistPipeline.exec();

      this.loggingService.debug(
        `Revoked all tokens for user ${userId}`,
        'revokeAllUserTokens',
        { userId, tokenCount: keys.length },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to revoke all user tokens', {
        source: TokenService.name,
        method: 'revokeAllUserTokens',
        userId,
      });
      return false;
    }
  }
}
