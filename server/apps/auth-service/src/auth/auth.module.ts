import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
  imports: [
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
    // Import CQRS Module
    AuthCqrsModule,
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
  controllers: [AuthController],
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
