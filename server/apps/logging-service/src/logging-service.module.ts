import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
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
import { ApiKeyStrategy } from './api/auth/api-key.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    PassportModule.register({ defaultStrategy: 'api-key' }),
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
    ApiKeyStrategy,
  ],
})
export class LoggingServiceModule {}
