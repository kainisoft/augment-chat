import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { LoggingModule } from '@app/logging';
import { SecurityLoggingService } from './security-logging.service';
import { SecurityLoggingRepository } from './security-logging.repository';
import { SecurityLoggingController } from './security-logging.controller';

@Module({
  imports: [ConfigModule, LoggingModule, RedisModule],
  controllers: [SecurityLoggingController],
  providers: [SecurityLoggingService, SecurityLoggingRepository],
  exports: [SecurityLoggingService, SecurityLoggingRepository],
})
export class SecurityLoggingModule {}
