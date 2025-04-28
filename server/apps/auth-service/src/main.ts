import { bootstrap } from '@app/common';
import { AuthServiceModule } from './auth-service.module';

async function startApplication() {
  try {
    await bootstrap(AuthServiceModule, {
      port: 4001,
      serviceName: 'Auth Service',
    });
  } catch (error) {
    console.error('Error starting Auth Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
