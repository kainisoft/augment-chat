import { Module } from '@nestjs/common';
import { LoggingModule } from '@app/logging';
import { RedisModule } from '@app/redis';
import { ConfigModule } from '@nestjs/config';
import { SessionService } from './session.service';

/**
 * Session Module
 *
 * Module for session management in the Auth Service.
 * Provides services for creating, retrieving, and managing user sessions.
 */
@Module({
  imports: [LoggingModule, RedisModule, ConfigModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
