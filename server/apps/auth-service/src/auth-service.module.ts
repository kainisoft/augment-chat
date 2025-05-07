import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { LoggingModule, LogLevel } from '@app/logging';
import { DatabaseModule } from '@app/database';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import {
  AuthServiceHealthController,
  AuthServiceHealthService,
} from './health/health.controller';
import { RepositoryProviders } from './infrastructure/repositories';

@Module({
  imports: [
    // Import ConfigModule for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Import CommonModule
    CommonModule,

    // Import DatabaseModule for database access
    DatabaseModule,

    // Import LoggingModule with Auth Service specific configuration
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
          service: 'auth-service',
          level,
          kafka: {
            brokers: configService
              .get<string>('KAFKA_BROKERS', 'kafka:29092')
              .split(','),
            topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
            clientId: 'auth-service',
          },
          console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
          redactFields: ['password', 'token', 'secret', 'authorization'],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthServiceController, AuthServiceHealthController],
  providers: [
    AuthServiceService,
    AuthServiceHealthService,
    ...RepositoryProviders,
  ],
})
export class AuthServiceModule {}
