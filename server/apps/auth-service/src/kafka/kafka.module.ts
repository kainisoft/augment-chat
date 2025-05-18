import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { KafkaConsumerService } from './kafka-consumer.service';
import { AuthEventHandlers } from './handlers/auth';
import { UserEventHandlers } from './handlers/user';
import { KafkaProducerModule } from './kafka-producer.module';

/**
 * Kafka Module for Auth Service
 *
 * Handles Kafka event communication for the Auth Service.
 */
@Module({
  imports: [LoggingModule, CqrsModule, KafkaProducerModule],
  providers: [KafkaConsumerService, ...AuthEventHandlers, ...UserEventHandlers],
  exports: [],
})
export class KafkaModule {}
