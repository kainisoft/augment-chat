import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { CommonModule } from '@app/common';

// Import handlers
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';
import { TokenService } from './token/token.service';
import { SessionService } from './session/session.service';
import { AccountLockoutService } from './domain/services/account-lockout.service';
import { CacheModule } from './cache/cache.module';
import { RepositoryModule } from './infrastructure/repositories/repository.module';

@Module({
  imports: [
    CqrsModule,
    // Import CommonModule for common services including ErrorLoggerService
    CommonModule,
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
    RedisModule.registerDefault({
      isGlobal: true,
      keyPrefix: 'auth:',
    }),
    // Import Cache Module for UserCacheService
    CacheModule,
    // Import Repository Module for repositories
    RepositoryModule,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    TokenService,
    SessionService,
    AccountLockoutService,
  ],
  exports: [CqrsModule],
})
export class AuthCqrsModule {}
