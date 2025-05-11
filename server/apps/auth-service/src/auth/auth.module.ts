import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { SessionService } from '../session/session.service';
import { RateLimitService, RateLimitGuard } from '../rate-limit';
import { RepositoryProviders } from '../infrastructure/repositories';
import { AuthCqrsModule } from '../auth-cqrs.module';

@Module({
  imports: [
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
