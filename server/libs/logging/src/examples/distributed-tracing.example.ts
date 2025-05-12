import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging.service';
import { randomUUID } from 'crypto';

/**
 * Example service that demonstrates distributed tracing with correlation IDs
 */
@Injectable()
export class ServiceA {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(ServiceA.name);
  }

  /**
   * Start a process that will be continued in another service
   */
  async startProcess(): Promise<string> {
    // Generate a correlation ID for this process
    const correlationId = `corr-${randomUUID()}`;
    
    // Set the correlation ID in the logging service
    this.loggingService.setCorrelationId(correlationId);
    
    // Log the start of the process
    this.loggingService.log('Starting process', 'startProcess', {
      processType: 'example',
    });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log that we're passing the process to another service
    this.loggingService.log('Passing process to ServiceB', 'startProcess', {
      processType: 'example',
      nextService: 'ServiceB',
    });
    
    // Return the correlation ID so it can be passed to the next service
    return correlationId;
  }
}

/**
 * Example service that continues a process started in another service
 */
@Injectable()
export class ServiceB {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(ServiceB.name);
  }

  /**
   * Continue a process started in another service
   */
  async continueProcess(correlationId: string): Promise<void> {
    // Set the correlation ID in the logging service
    this.loggingService.setCorrelationId(correlationId);
    
    // Log that we're continuing the process
    this.loggingService.log('Continuing process from ServiceA', 'continueProcess', {
      processType: 'example',
      previousService: 'ServiceA',
    });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log that we're completing the process
    this.loggingService.log('Process completed', 'continueProcess', {
      processType: 'example',
      status: 'success',
    });
  }
}

/**
 * Example of how to use the services together
 */
async function runExample() {
  // Create the logging service
  const loggingService = new LoggingService(null, {
    service: 'distributed-tracing-example',
    level: 'debug',
    console: true,
  });
  
  // Create the services
  const serviceA = new ServiceA(loggingService);
  const serviceB = new ServiceB(loggingService);
  
  try {
    // Start the process in ServiceA
    console.log('Starting process in ServiceA...');
    const correlationId = await serviceA.startProcess();
    
    // Continue the process in ServiceB
    console.log('Continuing process in ServiceB...');
    await serviceB.continueProcess(correlationId);
    
    console.log('Process completed successfully');
  } catch (error) {
    console.error('Error running example:', error);
  } finally {
    // Close the logging service
    await loggingService.close();
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample()
    .then(() => {
      console.log('Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Example failed:', error);
      process.exit(1);
    });
}
