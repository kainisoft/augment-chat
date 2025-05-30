import { bootstrap } from '@app/bootstrap';
import { UserServiceModule } from './user-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(UserServiceModule, {
      port: 4002,
      serviceName: 'User Service',
      enableValidation: true,
      enableCors: true,
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting User Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
