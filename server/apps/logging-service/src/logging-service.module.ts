import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from '@app/security';
import { LoggingModule, LogLevel } from '@app/logging';
import { LoggingServiceController } from './logging-service.controller';
import { LoggingServiceService } from './logging-service.service';
import { LogConsumerService } from './kafka/log-consumer.service';
import { LogMessageValidator } from './kafka/log-message.validator';
import { LogProcessorService } from './processing/log-processor.service';
import { LogFilterService } from './processing/log-filter.service';
import { LogBatchService } from './processing/log-batch.service';
import { LokiClientService } from './loki/loki-client.service';
import { LokiLabelService } from './loki/loki-label.service';
import { LokiInitializerService } from './loki/loki-initializer.service';
import { LogApiController } from './api/log-api.controller';
import { LogQueryService } from './api/log-query.service';
import { LogLevelService } from './api/log-level.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    LoggingModule.registerAsync({
      useFactory: () => ({
        service: 'logging-service',
        level: LogLevel.INFO,
        kafka: {
          brokers: ['kafka:29092'],
          topic: 'logs',
          clientId: 'logging-service',
        },
        console: true,
        redactFields: ['password', 'token', 'secret', 'authorization'],
      }),
    }),
    SecurityModule.registerRateGuard({
      isGlobal: true,
      maxAttempts: 10,
      windowSeconds: 60,
      blockSeconds: 60,
    }),
  ],
  controllers: [LoggingServiceController, LogApiController],
  providers: [
    LoggingServiceService,
    LogConsumerService,
    LogMessageValidator,
    LogProcessorService,
    LogFilterService,
    LogBatchService,
    LokiClientService,
    LokiLabelService,
    LokiInitializerService,
    LogQueryService,
    LogLevelService,
  ],
})
export class LoggingServiceModule {}
