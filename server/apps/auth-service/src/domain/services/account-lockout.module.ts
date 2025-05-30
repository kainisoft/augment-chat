import { Module } from '@nestjs/common';
import { LoggingModule } from '@app/logging';
import { RedisModule } from '@app/redis';
import { ConfigModule } from '@nestjs/config';
import { AccountLockoutService } from './account-lockout.service';

/**
 * Account Lockout Module
 *
 * Module for account lockout functionality in the Auth Service.
 * Provides services for managing account lockouts due to failed login attempts.
 */
@Module({
  imports: [LoggingModule, RedisModule, ConfigModule],
  providers: [AccountLockoutService],
  exports: [AccountLockoutService],
})
export class AccountLockoutModule {}
