import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { KafkaConsumerService } from './kafka-consumer.service';
import { AuthEventHandlers } from './handlers/auth';
import { KafkaProducerModule } from './kafka-producer.module';

/**
 * Kafka Module for User Service
 *
 * Handles Kafka event communication for the User Service.
 */
@Module({
  imports: [LoggingModule, CqrsModule, KafkaProducerModule],
  providers: [KafkaConsumerService, ...AuthEventHandlers],
  exports: [],
})
export class KafkaModule {}
