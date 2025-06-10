import { bootstrap } from '@app/bootstrap';
import { WebsocketGatewayModule } from './websocket-gateway.module';

async function startApplication() {
  try {
    await bootstrap(WebsocketGatewayModule, {
      port: 4001,
      serviceName: 'WebSocket Gateway',
      enableValidation: true,
      enableCors: true,
    });

    // HMR is now handled automatically by the bootstrap service
  } catch (error) {
    console.error('Error starting WebSocket Gateway:', error);
    process.exit(1);
  }
}

// Use void to explicitly mark the promise as intentionally not awaited
void startApplication();
