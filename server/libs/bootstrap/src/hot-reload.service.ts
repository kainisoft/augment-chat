import { Injectable, Logger } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';

/**
 * Hot Reload Service
 *
 * Provides standardized Hot Module Replacement (HMR) setup
 * for development environments across all microservices.
 */
@Injectable()
export class HotReloadService {
  private readonly logger = new Logger(HotReloadService.name);

  /**
   * Setup Hot Module Replacement for the application
   * @param app The NestJS application instance
   */
  setup(app: INestApplication): void {
    if (this.isHmrEnabled()) {
      this.enableHmr(app);
    }
  }

  /**
   * Check if HMR should be enabled
   */
  private isHmrEnabled(): boolean {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Check if HMR is explicitly enabled/disabled
    const hmrEnabled = process.env.HMR_ENABLED;
    if (hmrEnabled !== undefined) {
      return hmrEnabled.toLowerCase() === 'true';
    }

    // Check if module.hot is available (webpack HMR)
    const moduleHot = (module as any)?.hot;

    return isDevelopment && !!moduleHot;
  }

  /**
   * Enable Hot Module Replacement
   */
  private enableHmr(app: INestApplication): void {
    const moduleHot = (module as any)?.hot;

    if (moduleHot) {
      this.logger.log('Hot Module Replacement enabled');

      // Accept hot updates
      moduleHot.accept();

      // Handle disposal
      moduleHot.dispose(() => {
        this.logger.log('Hot Module Replacement: disposing application');
        app.close();
      });

      // Handle errors
      moduleHot.addErrorHandler((error: Error) => {
        this.logger.error('Hot Module Replacement error:', error);
      });

      // Handle status changes
      moduleHot.addStatusHandler((status: string) => {
        this.logger.debug(`Hot Module Replacement status: ${status}`);
      });
    } else {
      this.logger.warn(
        'Hot Module Replacement requested but module.hot is not available',
      );
    }
  }

  /**
   * Create a standardized HMR setup function for main.ts files
   */
  static createHmrSetup(app: INestApplication): void {
    const hotReloadService = new HotReloadService();
    hotReloadService.setup(app);
  }

  /**
   * Create a standardized error handler for application startup
   */
  static createErrorHandler(serviceName: string) {
    return (error: Error): void => {
      const logger = new Logger('Bootstrap');
      logger.error(`Error starting ${serviceName}:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      process.exit(1);
    };
  }

  /**
   * Create a standardized startup function template
   */
  static createStartupFunction(
    moduleName: string,
    options: {
      port: number;
      serviceName: string;
    },
  ) {
    return async function startApplication() {
      try {
        // Dynamic import to avoid circular dependencies
        const { bootstrap } = await import('./bootstrap.service');
        const { default: AppModule } = await import(moduleName);

        const app = await bootstrap(AppModule, {
          port: options.port,
          serviceName: options.serviceName,
        });

        // Setup HMR
        HotReloadService.createHmrSetup(app);
      } catch (error) {
        HotReloadService.createErrorHandler(options.serviceName)(error);
      }
    };
  }
}
