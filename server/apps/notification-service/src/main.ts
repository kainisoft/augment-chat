import { bootstrap } from '@app/common';
import { NotificationServiceModule } from './notification-service.module';

async function startApplication() {
  try {
    await bootstrap(NotificationServiceModule, {
      port: 4004,
      serviceName: 'Notification Service',
    });
  } catch (error) {
    console.error('Error starting Notification Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
