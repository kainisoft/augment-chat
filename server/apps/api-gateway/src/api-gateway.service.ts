import { Injectable } from '@nestjs/common';
import { LoggingService } from '@app/logging';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly loggingService: LoggingService) {
    // Set context for all logs from this service
    this.loggingService.setContext(ApiGatewayService.name);
  }

  getHello(): string {
    this.loggingService.debug('Generating hello message', 'getHello');
    return 'Hello World!';
  }
}
