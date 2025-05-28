// Core module and backward compatibility
export { KafkaModule, KafkaModuleOptions } from './kafka.module';
export { KafkaService } from './kafka.service';

// Enhanced services
export {
  KafkaProducerService,
  KafkaMessage,
  ProducerMetrics,
} from './producer/kafka-producer.service';
export {
  ConsumerMetrics,
  MessageHandler,
  MessageContext,
} from './consumer/kafka-consumer.service';
export {
  KafkaHealthService,
  KafkaHealthStatus,
} from './health/kafka-health.service';
export {
  KafkaConfigurationService,
  KafkaClientConfig,
  KafkaProducerConfig,
  KafkaConsumerConfig,
} from './config/kafka-configuration.service';
