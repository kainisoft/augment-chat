import { Controller, Get, Req } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { NotificationServiceService } from './notification-service.service';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationServiceService: NotificationServiceService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(NotificationServiceController.name);
  }

  @Get()
  getHello(@Req() request: any): string {
    // Log the request
    this.loggingService.log('Processing getHello request', 'getHello', {
      path: request.url,
    });

    const result = this.notificationServiceService.getHello();

    // Log the response
    this.loggingService.debug('Returning hello response', 'getHello', {
      response: result,
    });

    return result;
  }
}
