import { Module, DynamicModule, Provider, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingService, LoggingModuleOptions } from './logging.service';

@Module({
  imports: [ConfigModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {
  /**
   * Register the logging module with the provided options
   * @param options The logging module options
   * @returns The dynamic module
   */
  static register(options: LoggingModuleOptions): DynamicModule {
    return {
      module: LoggingModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'LOGGING_OPTIONS',
          useValue: options,
        },
        LoggingService,
      ],
      exports: [LoggingService],
    };
  }

  /**
   * Register the logging module as a global module with the provided options
   * @param options The logging module options
   * @returns The dynamic module
   */
  static registerGlobal(options: LoggingModuleOptions): DynamicModule {
    return {
      module: LoggingModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'LOGGING_OPTIONS',
          useValue: options,
        },
        LoggingService,
      ],
      exports: [LoggingService],
      global: true,
    };
  }

  /**
   * Register the logging module asynchronously
   * @param options The async module options
   * @returns The dynamic module
   */
  static registerAsync(options: LoggingModuleAsyncOptions): DynamicModule {
    return {
      module: LoggingModule,
      imports: [...(options.imports || []), ConfigModule],
      providers: [
        ...this.createAsyncProviders(options),
        LoggingService,
        ...(options.providers || []),
      ],
      exports: [LoggingService],
      global: options.isGlobal,
    };
  }

  /**
   * Create async providers for the logging module
   * @param options The async module options
   * @returns The providers
   */
  private static createAsyncProviders(
    options: LoggingModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  /**
   * Create async options provider for the logging module
   * @param options The async module options
   * @returns The provider
   */
  private static createAsyncOptionsProvider(
    options: LoggingModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'LOGGING_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'LOGGING_OPTIONS',
      useFactory: async (optionsFactory: LoggingModuleOptionsFactory) =>
        await optionsFactory.createLoggingOptions(),
      inject: [options.useExisting || options.useClass!],
    };
  }
}

/**
 * Interface for creating logging module options
 */
export interface LoggingModuleOptionsFactory {
  createLoggingOptions(): Promise<LoggingModuleOptions> | LoggingModuleOptions;
}

/**
 * Options for asynchronously configuring the logging module
 */
export interface LoggingModuleAsyncOptions {
  /**
   * Whether to register the module as global
   */
  isGlobal?: boolean;

  /**
   * Modules to import
   */
  imports?: any[];

  /**
   * Additional providers to register
   */
  providers?: Provider[];

  /**
   * Factory function to create the options
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<LoggingModuleOptions> | LoggingModuleOptions;

  /**
   * Dependencies to inject into the factory function
   */
  inject?: any[];

  /**
   * Existing provider to use
   */
  useExisting?: Type<LoggingModuleOptionsFactory>;

  /**
   * Class to use to create the options
   */
  useClass?: Type<LoggingModuleOptionsFactory>;
}
