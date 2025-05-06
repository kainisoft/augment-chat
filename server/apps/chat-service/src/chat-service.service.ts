import { Injectable } from '@nestjs/common';
import { LoggingService, ChatLogMetadata } from '@app/logging';

@Injectable()
export class ChatServiceService {
  constructor(private readonly loggingService: LoggingService) {
    // Set context for all logs from this service
    this.loggingService.setContext(ChatServiceService.name);
  }

  getHello(): string {
    // Create type-safe chat metadata
    const metadata: ChatLogMetadata = {
      chatId: 'system',
      userId: 'system',
      action: 'get-hello',
      messageType: 'system',
    };

    this.loggingService.debug<ChatLogMetadata>(
      'Generating hello message',
      'getHello',
      metadata,
    );

    return 'Hello from Chat Service!';
  }
}
