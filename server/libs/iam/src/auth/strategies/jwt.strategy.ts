import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IamConfigService } from '../../config/iam-config.service';
import { JwtPayload, TokenType } from '../interfaces/jwt-payload.interface';
import { IamService } from '../../iam.service';

/**
 * JWT authentication strategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: IamConfigService,
    private readonly iamService: IamService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  /**
   * Validate JWT payload
   * @param payload JWT payload
   * @returns Validated user data
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    try {
      // Check if token is of the correct type
      if (payload.type !== TokenType.ACCESS) {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.iamService.isTokenBlacklisted(
        payload.sub,
        payload.sessionId,
      );

      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Return the payload to be attached to the request
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
