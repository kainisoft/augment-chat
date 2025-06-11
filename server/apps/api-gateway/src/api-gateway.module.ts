import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { SecurityModule } from '@app/security';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import {
  ApiGatewayHealthController,
  ApiGatewayHealthService,
} from './health/health.controller';
import { ApiGatewayGraphQLModule } from './graphql/graphql.module';
import { ServiceDiscoveryModule } from './services/service-discovery.module';
import { RoutingModule } from './routing/routing.module';

@Module({
  imports: [
    // Import ConfigModule for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Import CommonModule
    CommonModule,

    // Import SecurityModule for authentication and authorization
    SecurityModule.registerAuthGuard({
      isGlobal: true,
      jwtModuleOptions: {
        secret: process.env.JWT_SECRET || 'api-gateway-secret-key',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        },
      },
    }),

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

    // Import Service Discovery Module
    ServiceDiscoveryModule,

    // Import Apollo Federation GraphQL Module
    ApiGatewayGraphQLModule,

    // Import Routing Module for intelligent request routing
    RoutingModule,
  ],
  controllers: [ApiGatewayController, ApiGatewayHealthController],
  providers: [ApiGatewayService, ApiGatewayHealthService],
})
export class ApiGatewayModule {}
