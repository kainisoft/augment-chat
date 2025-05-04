import { Controller, Get, Req } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserServiceController {
  constructor(
    private readonly userServiceService: UserServiceService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(UserServiceController.name);
  }

  @Get()
  getHello(@Req() request: any): string {
    // Log the request
    this.loggingService.log('Processing getHello request', 'getHello', {
      path: request.url,
    });

    const result = this.userServiceService.getHello();

    // Log the response
    this.loggingService.debug('Returning hello response', 'getHello', {
      response: result,
    });

    return result;
  }
}
