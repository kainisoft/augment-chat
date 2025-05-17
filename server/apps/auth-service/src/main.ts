import { bootstrap } from '@app/common';
import { AuthServiceModule } from './auth-service.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(AuthServiceModule, {
      port: 4001,
      serviceName: 'Auth Service',
    });

    // Enable Hot Module Replacement (HMR)
    if (module.hot) {
      // module.hot.accept();
      // module.hot.dispose(() => app.close());
    }
  } catch (error) {
    console.error('Error starting Auth Service:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
