import { KafkaTransport } from '../transports/kafka.transport';
import { LogLevel } from '../interfaces/log-message.interface';

/**
 * This is a simple test file to demonstrate how to use the Kafka transport.
 * In a real application, you would use Jest or another testing framework.
 */
async function testKafkaTransport() {
  // Create a Kafka transport
  const transport = new KafkaTransport({
    brokers: ['localhost:9092'],
    clientId: 'test-client',
    topic: 'logs',
    service: 'test-service',
    level: 'info',
    redactFields: ['password', 'token'],
  });

  // Set context and metadata
  transport.setContext('TestContext');
  transport.setRequestId('req-123');
  transport.setUserId('user-456');
  transport.setCorrelationId('corr-789');

  // Log a message
  await new Promise<void>((resolve) => {
    transport.log(
      {
        level: LogLevel.INFO,
        message: 'This is a test message',
        meta: {
          testField: 'test value',
          password: 'secret',
        },
      },
      () => {
        console.log('Log sent to Kafka');
        resolve();
      },
    );
  });

  // Log an error
  await new Promise<void>((resolve) => {
    transport.log(
      {
        level: LogLevel.ERROR,
        message: 'This is an error message',
        stack: new Error('Test error').stack,
        meta: {
          errorCode: 500,
          token: 'secret-token',
        },
      },
      () => {
        console.log('Error log sent to Kafka');
        resolve();
      },
    );
  });

  // Close the transport
  await transport.close();
  console.log('Transport closed');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testKafkaTransport()
    .then(() => {
      console.log('Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}
