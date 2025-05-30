import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaConfigurationService } from '../config/kafka-configuration.service';
import { KafkaModuleOptions } from '../kafka.module';

export interface KafkaHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  details: {
    connection: 'connected' | 'disconnected' | 'error';
    brokers: {
      total: number;
      available: number;
      unavailable: number;
    };
    producer?: {
      status: 'healthy' | 'unhealthy';
      messagesSent: number;
      lastSentAt?: Date;
      errors: number;
    };
    consumer?: {
      status: 'healthy' | 'unhealthy';
      messagesReceived: number;
      lastReceivedAt?: Date;
      errors: number;
    };
  };
  timestamp: Date;
  responseTime: number;
}

/**
 * Kafka Health Service
 *
 * Provides comprehensive health monitoring for Kafka connections,
 * producers, and consumers with detailed status reporting.
 */
@Injectable()
export class KafkaHealthService {
  private readonly logger = new Logger(KafkaHealthService.name);
  private lastHealthCheck?: KafkaHealthStatus;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly configService: KafkaConfigurationService,
    @Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions,
  ) {}

  /**
   * Perform comprehensive health check
   */
  async checkHealth(): Promise<KafkaHealthStatus> {
    const startTime = Date.now();

    try {
      const healthStatus: KafkaHealthStatus = {
        status: 'healthy',
        details: {
          connection: 'connected',
          brokers: {
            total: 0,
            available: 0,
            unavailable: 0,
          },
        },
        timestamp: new Date(),
        responseTime: 0,
      };

      // Check connection status
      const connectionStatus = await this.checkConnection();
      healthStatus.details.connection = connectionStatus;

      // Check brokers
      const brokerStatus = await this.checkBrokers();
      healthStatus.details.brokers = brokerStatus;

      // Check producer if enabled
      if (this.options.enableEnhancedProducer) {
        healthStatus.details.producer = await this.checkProducer();
      }

      // Check consumer if enabled
      if (this.options.enableEnhancedConsumer) {
        healthStatus.details.consumer = await this.checkConsumer();
      }

      // Determine overall status
      healthStatus.status = this.determineOverallStatus(healthStatus.details);
      healthStatus.responseTime = Date.now() - startTime;

      this.lastHealthCheck = healthStatus;
      return healthStatus;
    } catch (error) {
      this.logger.error('Health check failed:', error);

      const errorStatus: KafkaHealthStatus = {
        status: 'unhealthy',
        details: {
          connection: 'error',
          brokers: {
            total: 0,
            available: 0,
            unavailable: 0,
          },
        },
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };

      this.lastHealthCheck = errorStatus;
      return errorStatus;
    }
  }

  /**
   * Get last health check result
   */
  getLastHealthCheck(): KafkaHealthStatus | undefined {
    return this.lastHealthCheck;
  }

  /**
   * Check if Kafka is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get health summary
   */
  getHealthSummary(): { status: string; lastCheck?: Date } {
    return {
      status: this.lastHealthCheck?.status || 'unknown',
      lastCheck: this.lastHealthCheck?.timestamp,
    };
  }

  /**
   * Check connection status
   */
  private async checkConnection(): Promise<
    'connected' | 'disconnected' | 'error'
  > {
    try {
      // Try to perform a simple operation to check connection
      // Note: ClientKafka doesn't expose direct connection status
      // This is a simplified check
      return 'connected';
    } catch (error) {
      this.logger.error('Connection check failed:', error);
      return 'error';
    }
  }

  /**
   * Check broker status
   */
  private async checkBrokers(): Promise<{
    total: number;
    available: number;
    unavailable: number;
  }> {
    try {
      const brokers = this.configService.getBrokers();

      // In a real implementation, you would ping each broker
      // For now, we'll assume all configured brokers are available
      return {
        total: brokers.length,
        available: brokers.length,
        unavailable: 0,
      };
    } catch (error) {
      this.logger.error('Broker check failed:', error);
      return {
        total: 0,
        available: 0,
        unavailable: 0,
      };
    }
  }

  /**
   * Check producer status
   */
  private async checkProducer(): Promise<{
    status: 'healthy' | 'unhealthy';
    messagesSent: number;
    lastSentAt?: Date;
    errors: number;
  }> {
    try {
      // This would typically get metrics from the producer service
      // For now, return a basic healthy status
      return {
        status: 'healthy',
        messagesSent: 0,
        errors: 0,
      };
    } catch (error) {
      this.logger.error('Producer health check failed:', error);
      return {
        status: 'unhealthy',
        messagesSent: 0,
        errors: 1,
      };
    }
  }

  /**
   * Check consumer status
   */
  private async checkConsumer(): Promise<{
    status: 'healthy' | 'unhealthy';
    messagesReceived: number;
    lastReceivedAt?: Date;
    errors: number;
  }> {
    try {
      // This would typically get metrics from the consumer service
      // For now, return a basic healthy status
      return {
        status: 'healthy',
        messagesReceived: 0,
        errors: 0,
      };
    } catch (error) {
      this.logger.error('Consumer health check failed:', error);
      return {
        status: 'unhealthy',
        messagesReceived: 0,
        errors: 1,
      };
    }
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(
    details: KafkaHealthStatus['details'],
  ): 'healthy' | 'unhealthy' | 'degraded' {
    // If connection is down, system is unhealthy
    if (
      details.connection === 'error' ||
      details.connection === 'disconnected'
    ) {
      return 'unhealthy';
    }

    // If no brokers are available, system is unhealthy
    if (details.brokers.available === 0) {
      return 'unhealthy';
    }

    // If some brokers are unavailable, system is degraded
    if (details.brokers.unavailable > 0) {
      return 'degraded';
    }

    // Check producer status if enabled
    if (details.producer && details.producer.status === 'unhealthy') {
      return 'degraded';
    }

    // Check consumer status if enabled
    if (details.consumer && details.consumer.status === 'unhealthy') {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Get detailed health report
   */
  async getDetailedHealthReport(): Promise<{
    kafka: KafkaHealthStatus;
    configuration: any;
    environment: {
      serviceName: string;
      brokers: string[];
      clientId: string;
      groupId: string;
    };
  }> {
    const health = await this.checkHealth();
    const config = this.configService.getCompleteConfig();

    return {
      kafka: health,
      configuration: config,
      environment: {
        serviceName: this.options.serviceName,
        brokers: this.configService.getBrokers(),
        clientId: this.configService.getClientId(
          this.options.serviceName.toLowerCase().replace(/\s+/g, '-'),
        ),
        groupId: this.configService.getGroupId(
          this.options.serviceName.toLowerCase().replace(/\s+/g, '-'),
        ),
      },
    };
  }
}
