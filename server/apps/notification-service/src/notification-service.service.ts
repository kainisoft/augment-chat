import { Injectable } from '@nestjs/common';
import {
  LoggingService,
  LogHelpers,
  NotificationLogMetadata,
} from '@app/logging';

@Injectable()
export class NotificationServiceService {
  constructor(private readonly loggingService: LoggingService) {
    // Set context for all logs from this service
    this.loggingService.setContext(NotificationServiceService.name);
  }

  getHello(): string {
    // Create type-safe notification metadata
    const metadata = LogHelpers.createNotificationLogMetadata(
      'service-operation',
      {
        channel: 'internal',
        success: true,
      },
    );

    this.loggingService.debug<NotificationLogMetadata>(
      'Generating hello message',
      'getHello',
      metadata,
    );

    return 'Hello World!';
  }
}
