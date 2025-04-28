import { bootstrap } from '@app/common';
import { ApiGatewayModule } from './api-gateway.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(ApiGatewayModule, {
      port: 4000,
      serviceName: 'API Gateway',
    });

    // Enable Hot Module Replacement (HMR)
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (error) {
    console.error('Error starting API Gateway:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
