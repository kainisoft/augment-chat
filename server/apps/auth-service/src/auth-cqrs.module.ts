import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { CommonModule } from '@app/common';
import { SecurityLoggingModule } from './security-logging/security-logging.module';

// Import handlers
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';
import { RepositoryProviders } from './infrastructure/repositories';
import { TokenService } from './token/token.service';
import { SessionService } from './session/session.service';
import { AccountLockoutService } from './domain/services/account-lockout.service';

@Module({
  imports: [
    CqrsModule,
    // Import CommonModule for common services including ErrorLoggerService
    CommonModule,
    // Import SecurityLoggingModule for security logging
    SecurityLoggingModule,
    // Import JWT Module for token generation and validation
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'change-me-in-production',
        ),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
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
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ...RepositoryProviders,
    TokenService,
    SessionService,
    AccountLockoutService,
  ],
  exports: [CqrsModule],
})
export class AuthCqrsModule {}
