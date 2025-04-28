import { bootstrap } from '@app/common';
import { ApiGatewayModule } from './api-gateway.module';

async function startApplication() {
  try {
    await bootstrap(ApiGatewayModule, {
      port: 4000,
      serviceName: 'API Gateway',
    });
  } catch (error) {
    console.error('Error starting API Gateway:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
