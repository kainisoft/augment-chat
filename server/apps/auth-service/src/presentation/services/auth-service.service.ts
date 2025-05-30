import { Injectable } from '@nestjs/common';
import { LoggingService, LogHelpers, AuthLogMetadata } from '@app/logging';

@Injectable()
export class AuthServiceService {
  constructor(private readonly loggingService: LoggingService) {
    // Set context for all logs from this service
    this.loggingService.setContext(AuthServiceService.name);
  }

  getHello(): string {
    // Create type-safe auth metadata
    const metadata = LogHelpers.createAuthLogMetadata('get-hello', {
      success: true,
    });

    this.loggingService.debug<AuthLogMetadata>(
      'Generating hello message',
      'getHello',
      metadata,
    );

    return 'Hello from Auth Service!';
  }
}
