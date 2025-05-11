import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';

// Import handlers
import { CommandHandlers } from './application/commands/handlers';
import { QueryHandlers } from './application/queries/handlers';
import { EventHandlers } from './application/events/handlers';
import { RepositoryProviders } from './infrastructure/repositories';
import { TokenService } from './token/token.service';
import { SessionService } from './session/session.service';

@Module({
  imports: [
    CqrsModule,
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
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
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
  ],
  exports: [CqrsModule],
})
export class AuthCqrsModule {}
