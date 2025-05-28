import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KafkaProducerService } from './producer/kafka-producer.service';
import { KafkaConsumerService } from './consumer/kafka-consumer.service';
import { KafkaHealthService } from './health/kafka-health.service';
import { KafkaConfigurationService } from './config/kafka-configuration.service';

export interface KafkaModuleOptions {
  /**
   * Service name for Kafka client identification
   */
  serviceName: string;

  /**
   * Enable enhanced producer functionality
   * @default false (maintains backward compatibility)
   */
  enableEnhancedProducer?: boolean;

  /**
   * Enable enhanced consumer functionality
   * @default false (maintains backward compatibility)
   */
  enableEnhancedConsumer?: boolean;

  /**
   * Enable health checks
   * @default true
   */
  enableHealthChecks?: boolean;

  /**
   * Custom Kafka configuration
   */
  kafkaConfig?: {
    brokers?: string[];
    clientId?: string;
    groupId?: string;
    retries?: number;
    retryDelayMs?: number;
  };
}

/**
 * Enhanced Kafka Module
 *
 * Provides shared Kafka client utilities for consistent
 * event-driven communication across all microservices.
 * Maintains backward compatibility with existing KafkaService.
 */
@Module({
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {
  /**
   * Register the enhanced Kafka module for a specific service
   */
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    const {
      serviceName,
      enableEnhancedProducer = false,
      enableEnhancedConsumer = false,
      enableHealthChecks = true,
    } = options;

    const providers = [
      KafkaService, // Keep existing service for backward compatibility
      {
        provide: 'KAFKA_OPTIONS',
        useValue: options,
      },
      KafkaConfigurationService,
    ];

    const exports = [KafkaService, KafkaConfigurationService];

    // Add enhanced producer if enabled
    if (enableEnhancedProducer) {
      providers.push(KafkaProducerService);
      exports.push(KafkaProducerService);
    }

    // Add enhanced consumer if enabled
    if (enableEnhancedConsumer) {
      providers.push(KafkaConsumerService);
      exports.push(KafkaConsumerService);
    }

    // Add health checks if enabled
    if (enableHealthChecks) {
      providers.push(KafkaHealthService);
      exports.push(KafkaHealthService);
    }

    return {
      module: KafkaModule,
      imports: [
        ConfigModule,
        // Register Kafka client for microservices
        ClientsModule.registerAsync([
          {
            name: 'KAFKA_CLIENT',
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');

              return {
                transport: Transport.KAFKA,
                options: {
                  client: {
                    clientId: options.kafkaConfig?.clientId || `${serviceKey}-client`,
                    brokers: options.kafkaConfig?.brokers ||
                      configService.get<string>('KAFKA_BROKERS', 'kafka:29092').split(','),
                  },
                  producer: {
                    allowAutoTopicCreation: false,
                    retries: options.kafkaConfig?.retries ||
                      configService.get<number>('KAFKA_RETRIES', 3),
                    retryDelayMs: options.kafkaConfig?.retryDelayMs ||
                      configService.get<number>('KAFKA_RETRY_DELAY_MS', 1000),
                  },
                  consumer: {
                    groupId: options.kafkaConfig?.groupId || `${serviceKey}-group`,
                    allowAutoTopicCreation: false,
                  },
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      providers,
      exports,
    };
  }
}
