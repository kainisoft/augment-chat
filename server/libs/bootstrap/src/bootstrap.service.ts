import { INestApplication, Type, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ServiceConfigurationService } from './service-configuration.service';

export interface BootstrapOptions {
  /**
   * The port to listen on
   * @default 4000
   */
  port?: number;

  /**
   * The host to listen on
   * @default '0.0.0.0'
   */
  host?: string;

  /**
   * The service name for logging
   */
  serviceName: string;

  /**
   * Enable validation pipes
   * @default true
   */
  enableValidation?: boolean;

  /**
   * Enable CORS
   * @default true
   */
  enableCors?: boolean;

  /**
   * Additional setup function to configure the application
   * @param app The NestJS application instance
   */
  setup?: (app: NestFastifyApplication) => Promise<void>;

  /**
   * Custom validation pipe options
   */
  validationOptions?: {
    transform?: boolean;
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transformOptions?: any;
  };
}

/**
 * Enhanced Bootstrap Service
 *
 * Provides standardized bootstrap functionality with common configurations
 * and patterns used across all microservices.
 */
export class BootstrapService {
  constructor(private readonly configService: ServiceConfigurationService) {}

  /**
   * Bootstrap a NestJS microservice with enhanced configuration
   * @param module The module to bootstrap
   * @param options Enhanced bootstrap options
   */
  async bootstrap(
    module: Type<any>,
    options: BootstrapOptions,
  ): Promise<INestApplication> {
    const {
      port = 4000,
      host = '0.0.0.0',
      serviceName,
      enableValidation = true,
      enableCors = true,
      setup,
      validationOptions = {},
    } = options;

    try {
      // Create the application with Fastify adapter
      const app = await NestFactory.create<NestFastifyApplication>(
        module,
        new FastifyAdapter(),
      );

      // Apply common configurations
      await this.applyCommonConfigurations(app, {
        enableValidation,
        enableCors,
        validationOptions,
      });

      // Apply additional setup if provided
      if (setup) {
        await setup(app);
      }

      // Start listening
      const finalPort = process.env.PORT ?? port;
      await app.listen(finalPort, host);

      // Log the URL
      const url = await app.getUrl();
      console.log(`${serviceName} is running on: ${url}`);

      return app;
    } catch (error) {
      this.handleBootstrapError(serviceName, error);
      throw error;
    }
  }

  /**
   * Apply common configurations to the application
   */
  private async applyCommonConfigurations(
    app: NestFastifyApplication,
    options: {
      enableValidation: boolean;
      enableCors: boolean;
      validationOptions: any;
    },
  ): Promise<void> {
    const { enableValidation, enableCors, validationOptions } = options;

    // Enable CORS if requested
    if (enableCors) {
      app.enableCors({
        origin: process.env.CORS_ORIGIN || true,
        credentials: true,
      });
    }

    // Setup global validation pipe if enabled
    if (enableValidation) {
      const defaultValidationOptions = {
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      };

      app.useGlobalPipes(
        new ValidationPipe({
          ...defaultValidationOptions,
          ...validationOptions,
        }),
      );
    }

    // Set global prefix for API routes
    const apiPrefix = process.env.API_PREFIX || 'api';
    if (apiPrefix) {
      app.setGlobalPrefix(apiPrefix);
    }
  }

  /**
   * Handle bootstrap errors with structured logging
   */
  private handleBootstrapError(serviceName: string, error: Error): void {
    console.error(`Error starting ${serviceName}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }
}

/**
 * Helper function for backward compatibility with existing bootstrap function
 */
export async function bootstrap(
  module: Type<any>,
  options: BootstrapOptions,
): Promise<INestApplication> {
  const bootstrapService = new BootstrapService(
    new ServiceConfigurationService(),
  );
  return bootstrapService.bootstrap(module, options);
}
