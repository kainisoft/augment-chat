import { Controller, Get } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(
    private readonly authServiceService: AuthServiceService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(AuthServiceController.name);
  }

  @Get()
  getHello(): string {
    this.loggingService.log('Processing getHello request', 'getHello', {
      service: 'auth-service',
    });
    return this.authServiceService.getHello();
  }
}
