import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { CommonModule } from '@app/common';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { RateLimitService, RateLimitGuard } from '../rate-limit';
import { RepositoryProviders } from '../infrastructure/repositories';
import { AuthCqrsModule } from '../auth-cqrs.module';

@Module({
  imports: [
    // Import CommonModule for common services including ErrorLoggerService
    CommonModule,
    // Import CQRS Module
    AuthCqrsModule,
    // Import DatabaseModule for database access
    DatabaseModule.forAuth(),
    // Import Redis Module for Redis connection
    RedisModule.registerDefault({
      isGlobal: true,
      keyPrefix: 'auth:',
    }),
  ],
  controllers: [],
  providers: [
    AuthService,
    TokenService,
    SessionService,
    RateLimitService,
    RateLimitGuard,
    ...RepositoryProviders,
  ],
  exports: [AuthService],
})
export class AuthModule {}
