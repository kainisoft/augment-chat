import { bootstrap } from '@app/common';
import { UserServiceModule } from './user-service.module';

async function startApplication() {
  try {
    await bootstrap(UserServiceModule, {
      port: 4002,
      serviceName: 'User Service',
    });
  } catch (error) {
    console.error('Error starting User Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
