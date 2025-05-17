import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@app/redis';
import { IamConfigService } from './config/iam-config.service';
import { JwtPayload, TokenType } from './auth/interfaces/jwt-payload.interface';
import { IAM_OPTIONS } from './constants/iam.constants';
import { IamOptions } from './interfaces/iam-options.interface';

/**
 * IAM service
 *
 * Provides authentication and authorization functionality
 */
@Injectable()
export class IamService {
  private readonly logger = new Logger(IamService.name);
  private readonly tokenBlacklistPrefix = 'iam:blacklist:';

  constructor(
    @Inject(IAM_OPTIONS) private readonly options: IamOptions,
    private readonly jwtService: JwtService,
    private readonly configService: IamConfigService,
    private readonly redisService: RedisService,
  ) {
    this.logger.log('IAM service initialized');
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
    const payload: JwtPayload = {
      sub: userId,
      type: TokenType.ACCESS,
      iat: Math.floor(Date.now() / 1000),
      ...additionalData,
    };

    return this.jwtService.sign(payload);
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
    const payload: JwtPayload = {
      sub: userId,
      type: TokenType.REFRESH,
      iat: Math.floor(Date.now() / 1000),
      ...additionalData,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.refreshTokenExpiresIn,
    });
  }

  /**
   * Validate a token
   * @param token Token to validate
   * @param type Expected token type
   * @returns Token payload if valid
   * @throws UnauthorizedException if token is invalid
   */
  async validateToken(token: string, type: TokenType): Promise<JwtPayload> {
    try {
      // Verify the token signature
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Check if token is of the expected type
      if (payload.type !== type) {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(
        payload.sub,
        payload.sessionId,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (error) {
      this.logger.error(
        `Token validation failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Revoke a token
   * @param userId User ID
   * @param sessionId Session ID
   * @returns True if token was revoked
   */
  async revokeToken(userId: string, sessionId?: string): Promise<boolean> {
    try {
      const key = `${this.tokenBlacklistPrefix}${userId}${sessionId ? `:${sessionId}` : ''}`;
      const ttl = 86400; // 24 hours in seconds
      await this.redisService.set(key, '1', ttl);
      this.logger.debug(
        `Revoked token for user ${userId}${sessionId ? ` with session ${sessionId}` : ''}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to revoke token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param userId User ID
   * @param sessionId Session ID
   * @returns True if token is blacklisted
   */
  async isTokenBlacklisted(
    userId: string,
    sessionId?: string,
  ): Promise<boolean> {
    try {
      const key = `${this.tokenBlacklistPrefix}${userId}${sessionId ? `:${sessionId}` : ''}`;
      return await this.redisService.exists(key);
    } catch (error) {
      this.logger.error(
        `Failed to check if token is blacklisted: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Check if a user has a specific role
   * @param user User object
   * @param role Role to check
   * @returns True if user has the role
   */
  hasRole(user: JwtPayload, role: string): boolean {
    return user.roles?.includes(role) || false;
  }

  /**
   * Check if a user has a specific permission
   * @param user User object
   * @param permission Permission to check
   * @returns True if user has the permission
   */
  hasPermission(user: JwtPayload, permission: string): boolean {
    return user.permissions?.includes(permission) || false;
  }
}
