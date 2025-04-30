import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingServiceController } from './logging-service.controller';
import { LoggingServiceService } from './logging-service.service';
import { LogConsumerService } from './kafka/log-consumer.service';
import { LogMessageValidator } from './kafka/log-message.validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
  ],
  controllers: [LoggingServiceController],
  providers: [LoggingServiceService, LogConsumerService, LogMessageValidator],
})
export class LoggingServiceModule {}
