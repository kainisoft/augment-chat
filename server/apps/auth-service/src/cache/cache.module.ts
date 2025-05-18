import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { LoggingModule } from '@app/logging';

@Module({
  imports: [RedisModule, LoggingModule],
  providers: [],
  exports: [RedisModule],
})
export class CacheModule {}
