import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
  ],
  controllers: [LoggingServiceController],
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
  ],
})
export class LoggingServiceModule {}
