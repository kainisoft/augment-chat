import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AUTH_GUARD_OPTIONS } from '../constants/security.constants';
import { AuthGuardOptions } from '../interfaces';
import { TokenType } from '../enums';
import { AuthGuardService } from '../services';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(AUTH_GUARD_OPTIONS)
    private readonly options: AuthGuardOptions,
    private readonly authGuardService: AuthGuardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = await this.authGuardService.validateToken(
        token,
        TokenType.ACCESS,
      );

      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    // Implement access token validation logic here
    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
