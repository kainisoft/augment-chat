import { INestApplication, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

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
   * Additional setup function to configure the application
   * @param app The NestJS application instance
   */
  setup?: (app: NestFastifyApplication) => Promise<void>;
}

/**
 * Bootstrap a NestJS microservice with common configuration
 * @param module The module to bootstrap
 * @param options Bootstrap options
 */
export async function bootstrap(
  module: Type<any>,
  options: BootstrapOptions,
): Promise<INestApplication> {
  const { port = 4000, host = '0.0.0.0', serviceName, setup } = options;

  // Create the application with Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    module,
    new FastifyAdapter(),
  );

  // Apply additional setup if provided
  if (setup) {
    await setup(app);
  }

  // Start listening
  await app.listen(process.env.PORT ?? port, host);

  // Log the URL
  const url = await app.getUrl();
  console.log(`${serviceName} is running on: ${url}`);

  return app;
}

/**
 * Helper function to handle bootstrap errors
 * @param serviceName The service name for error logging
 */
export function handleBootstrapError(serviceName: string) {
  return (error: Error): void => {
    console.error(`Error starting ${serviceName}:`, error);
    process.exit(1);
  };
}
