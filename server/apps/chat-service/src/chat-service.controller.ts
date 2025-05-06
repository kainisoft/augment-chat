import { Controller, Get } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { ChatServiceService } from './chat-service.service';

@Controller()
export class ChatServiceController {
  constructor(
    private readonly chatServiceService: ChatServiceService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(ChatServiceController.name);
  }

  @Get()
  getHello(): string {
    this.loggingService.log('Processing getHello request', 'getHello', {
      service: 'chat-service',
    });
    return this.chatServiceService.getHello();
  }
}
