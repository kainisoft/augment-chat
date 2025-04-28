import { bootstrap } from '@app/common';
import { ChatServiceModule } from './chat-service.module';

async function startApplication() {
  try {
    await bootstrap(ChatServiceModule, {
      port: 4003,
      serviceName: 'Chat Service',
    });
  } catch (error) {
    console.error('Error starting Chat Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
