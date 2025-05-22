import { Module } from '@nestjs/common';
import { LoggingModule } from '@app/logging';
import { RedisModule } from '@app/redis';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token.service';
import { JwtModule } from '../infrastructure/jwt/jwt.module';

/**
 * Token Module
 *
 * Module for token management in the Auth Service.
 * Provides services for token generation, validation, and storage.
 */
@Module({
  imports: [LoggingModule, RedisModule, ConfigModule, JwtModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
