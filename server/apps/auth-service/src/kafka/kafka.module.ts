import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { KafkaConsumerService } from './kafka-consumer.service';
import { AuthEventHandlers } from './handlers/auth';
import { UserEventHandlers } from './handlers/user';
import { KafkaProducerModule } from './kafka-producer.module';
import { CacheModule } from '../cache/cache.module';
import { PermissionModule } from '../permission/permission.module';

/**
 * Kafka Module for Auth Service
 *
 * Handles Kafka event communication for the Auth Service.
 * Imports CacheModule to provide UserCacheService and PermissionModule
 * to provide PermissionCacheService for event handlers.
 */
@Module({
  imports: [
    LoggingModule,
    CqrsModule,
    KafkaProducerModule,
    CacheModule,
    PermissionModule,
  ],
  providers: [KafkaConsumerService, ...AuthEventHandlers, ...UserEventHandlers],
  exports: [],
})
export class KafkaModule {}
