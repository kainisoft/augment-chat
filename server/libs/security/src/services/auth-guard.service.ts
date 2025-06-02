import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@app/redis';
import { AUTH_GUARD_OPTIONS } from '../constants';
import { AuthGuardOptions } from '../interfaces';
import { JwtPayload } from '../interfaces';
import { TokenType } from '../enums';

@Injectable()
export class AuthGuardService {
  private readonly blacklistPrefix = 'security:auth:guard:blacklist:';

  constructor(
    @Inject(AUTH_GUARD_OPTIONS)
    private readonly options: AuthGuardOptions,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

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

    return this.jwtService.signAsync(payload, this.options.jwtModuleOptions);
  }

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

    return this.jwtService.signAsync(payload, this.options.jwtModuleOptions);
  }

  async validateToken(token: string, type: TokenType): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        this.options.jwtModuleOptions,
      );

      if (payload.type !== type) {
        throw new UnauthorizedException('Invalid token type');
      }

      const isBlacklisted = await this.isTokenBlacklisted(
        payload.sub,
        payload.sessionId,
      );

      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async isTokenBlacklisted(
    userId: string,
    sessionId?: string,
  ): Promise<boolean> {
    try {
      const key = `${this.blacklistPrefix}${userId}${sessionId ?? ''}`;
      return await this.redisService.exists(key);
    } catch (error) {
      return false;
    }
  }

  async revokeToken(userId: string, sessionId?: string): Promise<boolean> {
    try {
      const key = `${this.blacklistPrefix}${userId}${sessionId ?? ''}`;
      await this.redisService.set(key, '1', 86400); // 24 hours in seconds
      return true;
    } catch (error) {
      return false;
    }
  }
}
