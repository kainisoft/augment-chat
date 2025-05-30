import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaModuleOptions } from '../kafka.module';

export interface KafkaClientConfig {
  brokers: string[];
  clientId: string;
  connectionTimeout: number;
  requestTimeout: number;
  retry: {
    retries: number;
    retryDelayMs: number;
  };
}

export interface KafkaProducerConfig {
  allowAutoTopicCreation: boolean;
  retries: number;
  retryDelayMs: number;
  maxInFlightRequests: number;
  idempotent: boolean;
}

export interface KafkaConsumerConfig {
  groupId: string;
  allowAutoTopicCreation: boolean;
  sessionTimeout: number;
  heartbeatInterval: number;
  maxWaitTimeInMs: number;
}

/**
 * Kafka Configuration Service
 *
 * Provides centralized configuration management for Kafka clients
 * with standardized defaults and environment-based overrides.
 */
@Injectable()
export class KafkaConfigurationService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions,
  ) {}

  /**
   * Get Kafka client configuration
   */
  getClientConfig(): KafkaClientConfig {
    const serviceKey = this.options.serviceName
      .toLowerCase()
      .replace(/\s+/g, '-');

    return {
      brokers: this.getBrokers(),
      clientId: this.getClientId(serviceKey),
      connectionTimeout: this.configService.get<number>(
        'KAFKA_CONNECTION_TIMEOUT',
        10000,
      ),
      requestTimeout: this.configService.get<number>(
        'KAFKA_REQUEST_TIMEOUT',
        30000,
      ),
      retry: {
        retries: this.configService.get<number>('KAFKA_RETRIES', 3),
        retryDelayMs: this.configService.get<number>(
          'KAFKA_RETRY_DELAY_MS',
          1000,
        ),
      },
    };
  }

  /**
   * Get Kafka producer configuration
   */
  getProducerConfig(): KafkaProducerConfig {
    return {
      allowAutoTopicCreation: this.configService.get<boolean>(
        'KAFKA_PRODUCER_AUTO_TOPIC_CREATION',
        false,
      ),
      retries: this.configService.get<number>('KAFKA_PRODUCER_RETRIES', 3),
      retryDelayMs: this.configService.get<number>(
        'KAFKA_PRODUCER_RETRY_DELAY_MS',
        1000,
      ),
      maxInFlightRequests: this.configService.get<number>(
        'KAFKA_PRODUCER_MAX_IN_FLIGHT_REQUESTS',
        5,
      ),
      idempotent: this.configService.get<boolean>(
        'KAFKA_PRODUCER_IDEMPOTENT',
        true,
      ),
    };
  }

  /**
   * Get Kafka consumer configuration
   */
  getConsumerConfig(): KafkaConsumerConfig {
    const serviceKey = this.options.serviceName
      .toLowerCase()
      .replace(/\s+/g, '-');

    return {
      groupId: this.getGroupId(serviceKey),
      allowAutoTopicCreation: this.configService.get<boolean>(
        'KAFKA_CONSUMER_AUTO_TOPIC_CREATION',
        false,
      ),
      sessionTimeout: this.configService.get<number>(
        'KAFKA_CONSUMER_SESSION_TIMEOUT',
        30000,
      ),
      heartbeatInterval: this.configService.get<number>(
        'KAFKA_CONSUMER_HEARTBEAT_INTERVAL',
        3000,
      ),
      maxWaitTimeInMs: this.configService.get<number>(
        'KAFKA_CONSUMER_MAX_WAIT_TIME',
        5000,
      ),
    };
  }

  /**
   * Get Kafka brokers list
   */
  getBrokers(): string[] {
    return (
      this.options.kafkaConfig?.brokers ||
      this.configService
        .get<string>('KAFKA_BROKERS', 'kafka:29092')
        .split(',')
        .map((broker) => broker.trim())
    );
  }

  /**
   * Get client ID
   */
  getClientId(serviceKey: string): string {
    return (
      this.options.kafkaConfig?.clientId ||
      this.configService.get<string>('KAFKA_CLIENT_ID') ||
      `${serviceKey}-client`
    );
  }

  /**
   * Get consumer group ID
   */
  getGroupId(serviceKey: string): string {
    return (
      this.options.kafkaConfig?.groupId ||
      this.configService.get<string>('KAFKA_GROUP_ID') ||
      `${serviceKey}-group`
    );
  }

  /**
   * Get topic configuration
   */
  getTopicConfig(topicName: string) {
    return {
      topic: topicName,
      numPartitions: this.configService.get<number>(
        `KAFKA_TOPIC_${topicName.toUpperCase()}_PARTITIONS`,
        1,
      ),
      replicationFactor: this.configService.get<number>(
        `KAFKA_TOPIC_${topicName.toUpperCase()}_REPLICATION_FACTOR`,
        1,
      ),
      configEntries: [
        {
          name: 'cleanup.policy',
          value: this.configService.get<string>(
            `KAFKA_TOPIC_${topicName.toUpperCase()}_CLEANUP_POLICY`,
            'delete',
          ),
        },
        {
          name: 'retention.ms',
          value: this.configService.get<string>(
            `KAFKA_TOPIC_${topicName.toUpperCase()}_RETENTION_MS`,
            '604800000',
          ), // 7 days
        },
      ],
    };
  }

  /**
   * Get complete Kafka configuration
   */
  getCompleteConfig() {
    return {
      client: this.getClientConfig(),
      producer: this.getProducerConfig(),
      consumer: this.getConsumerConfig(),
      brokers: this.getBrokers(),
    };
  }

  /**
   * Validate Kafka configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate brokers
    const brokers = this.getBrokers();
    if (!brokers || brokers.length === 0) {
      errors.push('Kafka brokers configuration is required');
    }

    // Validate broker format
    for (const broker of brokers) {
      if (!broker.includes(':')) {
        errors.push(
          `Invalid broker format: ${broker}. Expected format: host:port`,
        );
      }
    }

    // Validate service name
    if (!this.options.serviceName) {
      errors.push('Service name is required for Kafka configuration');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
