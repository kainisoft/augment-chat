import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import {
  ApiGatewayHealthController,
  ApiGatewayHealthService,
} from './health/health.controller';
import { ApiGatewayGraphQLModule } from './graphql/graphql.module';

@Module({
  imports: [
    // Import ConfigModule for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Import CommonModule
    CommonModule,

    // Import LoggingModule with API Gateway specific configuration
    LoggingModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Get log level from environment or use default
        const logLevelStr = configService.get<string>('LOG_LEVEL', 'info');
        // Map string to LogLevel enum
        const level =
          logLevelStr === 'error'
            ? LogLevel.ERROR
            : logLevelStr === 'warn'
              ? LogLevel.WARN
              : logLevelStr === 'debug'
                ? LogLevel.DEBUG
                : logLevelStr === 'verbose'
                  ? LogLevel.VERBOSE
                  : LogLevel.INFO;

        return {
          service: 'api-gateway',
          level,
          kafka: {
            brokers: configService
              .get<string>('KAFKA_BROKERS', 'kafka:29092')
              .split(','),
            topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
            clientId: 'api-gateway',
          },
          console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
          redactFields: ['password', 'token', 'secret', 'authorization'],
        };
      },
      inject: [ConfigService],
    }),

    // Import Apollo Federation GraphQL Module
    ApiGatewayGraphQLModule,
  ],
  controllers: [ApiGatewayController, ApiGatewayHealthController],
  providers: [ApiGatewayService, ApiGatewayHealthService],
})
export class ApiGatewayModule {}
