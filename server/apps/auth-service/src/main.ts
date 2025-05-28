import { bootstrap } from '@app/bootstrap';
import { AuthServiceModule } from './auth-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(AuthServiceModule, {
      port: 4001,
      serviceName: 'Auth Service',
      enableValidation: true,
      enableCors: true,
      enableHmr: process.env.NODE_ENV === 'development',
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting Auth Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
