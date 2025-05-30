import { bootstrap } from '@app/bootstrap';
import { ChatServiceModule } from './chat-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(ChatServiceModule, {
      port: 4003,
      serviceName: 'Chat Service',
      enableValidation: true,
      enableCors: true,
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting Chat Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
