import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigurationService } from './configuration.service';
import { EnvironmentValidationService } from './environment-validation.service';
import { ConfigurationFactory } from './configuration.factory';

export interface ConfigModuleOptions {
  /**
   * Service name for configuration context
   */
  serviceName: string;

  /**
   * Enable environment validation
   * @default true
   */
  enableValidation?: boolean;

  /**
   * Custom configuration files to load
   */
  configFiles?: string[];

  /**
   * Environment variables prefix
   */
  envPrefix?: string;

  /**
   * Enable global configuration
   * @default true
   */
  isGlobal?: boolean;
}

/**
 * Configuration Module
 *
 * Provides enhanced configuration management utilities for microservices.
 * Includes environment validation, type-safe configuration, and
 * standardized configuration patterns.
 */
@Module({})
export class ConfigModule {
  /**
   * Register the Configuration module for a specific service
   */
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    const {
      serviceName,
      enableValidation = true,
      configFiles = [],
      envPrefix,
      isGlobal = true,
    } = options;

    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal,
          envFilePath: ['.env.local', '.env', ...configFiles],
          expandVariables: true,
          cache: true,
        }),
      ],
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigurationService,
        EnvironmentValidationService,
        ConfigurationFactory,
      ],
      exports: [
        ConfigurationService,
        EnvironmentValidationService,
        ConfigurationFactory,
        NestConfigModule,
      ],
    };
  }

  /**
   * Register the Configuration module for feature modules
   */
  static forFeature(configFactory: () => Record<string, any>): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'FEATURE_CONFIG',
          useFactory: configFactory,
        },
      ],
      exports: ['FEATURE_CONFIG'],
    };
  }
}
