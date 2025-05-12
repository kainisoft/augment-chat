import { LoggingService } from '../logging.service';

/**
 * This is a simple test file to demonstrate how to use the correlation ID feature.
 * In a real application, you would use Jest or another testing framework.
 */
async function testCorrelationId() {
  // Create a logging service
  const loggingService = new LoggingService(null, {
    service: 'correlation-id-test',
    level: 'debug',
    console: true,
  });

  // Set context
  loggingService.setContext('CorrelationIdTest');

  // Log without correlation ID
  loggingService.log('Log message without correlation ID');

  // Set correlation ID
  const correlationId = 'corr-test-123';
  loggingService.setCorrelationId(correlationId);

  // Log with correlation ID
  loggingService.log('Log message with correlation ID');

  // Log with request ID and correlation ID
  const requestId = 'req-test-456';
  loggingService.setRequestId(requestId);
  loggingService.log('Log message with request ID and correlation ID');

  // Log with user ID, request ID, and correlation ID
  const userId = 'user-test-789';
  loggingService.setUserId(userId);
  loggingService.log('Log message with user ID, request ID, and correlation ID');

  // Log with metadata
  loggingService.log('Log message with metadata', 'testMethod', {
    testField: 'test value',
    anotherField: 123,
  });

  // Log at different levels
  loggingService.debug('Debug message with correlation ID');
  loggingService.warn('Warning message with correlation ID');
  loggingService.error('Error message with correlation ID', new Error('Test error').stack);
  loggingService.verbose('Verbose message with correlation ID');

  // Close the logging service
  await loggingService.close();
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCorrelationId()
    .then(() => {
      console.log('Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}
