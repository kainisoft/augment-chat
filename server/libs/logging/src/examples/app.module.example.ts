import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingModule } from '../logging.module';
import { LogLevel } from '../interfaces/log-message.interface';

/**
 * Example of how to use the LoggingModule in a NestJS application
 */
@Module({
  imports: [
    // Import ConfigModule for configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Method 1: Register with static options
    LoggingModule.register({
      service: 'example-service',
      level: LogLevel.INFO,
      kafka: {
        brokers: ['localhost:9092'],
        topic: 'logs',
        clientId: 'example-service',
      },
      console: true,
      redactFields: ['password', 'token', 'secret'],
    }),

    // Method 2: Register as global module
    // LoggingModule.registerGlobal({
    //   service: 'example-service',
    //   level: LogLevel.INFO,
    //   kafka: {
    //     brokers: ['localhost:9092'],
    //     topic: 'logs',
    //     clientId: 'example-service',
    //   },
    //   console: true,
    //   redactFields: ['password', 'token', 'secret'],
    // }),

    // Method 3: Register asynchronously with factory
    // LoggingModule.registerAsync({
    //   isGlobal: true,
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     service: configService.get<string>('SERVICE_NAME', 'example-service'),
    //     level: configService.get<LogLevel>('LOG_LEVEL', LogLevel.INFO),
    //     kafka: {
    //       brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
    //       topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
    //       clientId: configService.get<string>('SERVICE_NAME', 'example-service'),
    //     },
    //     console: configService.get<boolean>('LOG_CONSOLE', true),
    //     redactFields: configService.get<string>('LOG_REDACT_FIELDS', 'password,token,secret').split(','),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
})
export class AppModule {}
