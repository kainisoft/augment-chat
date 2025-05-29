import { bootstrap } from '@app/bootstrap';
import { ApiGatewayModule } from './api-gateway.module';

declare const module: any;

async function startApplication() {
  try {
    const app = await bootstrap(ApiGatewayModule, {
      port: 4000,
      serviceName: 'API Gateway',
      enableValidation: true,
      enableCors: true,
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting API Gateway:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
