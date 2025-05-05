import { bootstrap } from '@app/common';
import { LoggingServiceModule } from './logging-service.module';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(LoggingServiceModule, {
      port: 4005,
      serviceName: 'Logging Service',
      // Add custom setup for validation pipes
      setup: (app) => {
        app.useGlobalPipes(
          new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
              enableImplicitConversion: false,
            },
          }),
        );
        return Promise.resolve();
      },
    });

    // Enable Hot Module Replacement (HMR)
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (error) {
    console.error('Error starting Logging Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
