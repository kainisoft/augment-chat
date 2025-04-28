import { bootstrap } from '@app/common';
import { NotificationServiceModule } from './notification-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(NotificationServiceModule, {
      port: 4004,
      serviceName: 'Notification Service',
    });

    // Enable Hot Module Replacement (HMR)
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (error) {
    console.error('Error starting Notification Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
