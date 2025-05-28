import { bootstrap } from '@app/bootstrap';
import { NotificationServiceModule } from './notification-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(NotificationServiceModule, {
      port: 4004,
      serviceName: 'Notification Service',
      enableValidation: true,
      enableCors: true,
      enableHmr: process.env.NODE_ENV === 'development',
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting Notification Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
