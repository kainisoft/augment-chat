import { Module } from '@nestjs/common';
import { LoggingModule } from '@app/logging';
import { CommonModule } from '@app/common';
import { AuthService } from './auth.service';
import { AuthCqrsModule } from '../auth-cqrs.module';
import { TokenModule } from '../token/token.module';
import { SessionModule } from '../session/session.module';
import { RateLimitService, RateLimitGuard } from '../rate-limit';
import { RepositoryModule } from '../infrastructure/repositories/repository.module';

/**
 * Auth Module
 *
 * Module for authentication functionality in the Auth Service.
 */
@Module({
  imports: [
    CommonModule,
    LoggingModule,
    AuthCqrsModule,
    TokenModule,
    SessionModule,
    RepositoryModule,
  ],
  controllers: [],
  providers: [AuthService, RateLimitService, RateLimitGuard],
  exports: [AuthService],
})
export class AuthModule {}
