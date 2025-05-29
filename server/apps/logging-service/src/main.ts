import { bootstrap } from '@app/bootstrap';
import { LoggingServiceModule } from './logging-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(LoggingServiceModule, {
      port: 4005,
      serviceName: 'Logging Service',
      enableValidation: true,
      enableCors: true,
      enableHmr: false,
      // Custom validation options for logging service
      validationOptions: {
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      },
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting Logging Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
