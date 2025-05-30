import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggingModule } from '@app/logging';
import { KafkaProducerService } from './kafka-producer.service';

/**
 * Kafka Producer Module
 *
 * Provides the KafkaProducerService for publishing events to Kafka.
 * This module is separate from the KafkaModule to avoid circular dependencies.
 */
@Module({
  imports: [
    LoggingModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-service-producer',
              brokers: configService
                .get<string>('KAFKA_BROKERS', 'kafka:29092')
                .split(','),
            },
            producer: {
              allowAutoTopicCreation: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
