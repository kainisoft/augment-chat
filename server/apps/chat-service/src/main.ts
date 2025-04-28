import { bootstrap } from '@app/common';
import { ChatServiceModule } from './chat-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(ChatServiceModule, {
      port: 4003,
      serviceName: 'Chat Service',
    });

    // Enable Hot Module Replacement (HMR)
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (error) {
    console.error('Error starting Chat Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
