import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { CommonModule } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { RateLimitService, RateLimitGuard } from '../rate-limit';
import { RepositoryProviders } from '../infrastructure/repositories';
import { AuthCqrsModule } from '../auth-cqrs.module';
import { SessionController } from '../session/session.controller';

@Module({
  imports: [
    // Import CommonModule for common services including ErrorLoggerService
    CommonModule,
    // Import CQRS Module
    AuthCqrsModule,
    // Import DatabaseModule for database access
    DatabaseModule.forAuth(),
    // Import Redis Module for Redis connection
    RedisModule.register({
      nodes: [
        {
          host: process.env.REDIS_NODE_1 || 'redis-node-1',
          port: +(process.env.REDIS_NODE_1_PORT || 6379),
        },
        {
          host: process.env.REDIS_NODE_2 || 'redis-node-2',
          port: +(process.env.REDIS_NODE_2_PORT || 6380),
        },
        {
          host: process.env.REDIS_NODE_3 || 'redis-node-3',
          port: +(process.env.REDIS_NODE_3_PORT || 6381),
        },
      ],
      password: process.env.REDIS_PASSWORD,
      keyPrefix: 'auth:',
    }),
  ],
  controllers: [AuthController, SessionController],
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
