import { Controller, Get, Req } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(ApiGatewayController.name);
  }

  @Get()
  getHello(@Req() request: any): string {
    // Log the request
    this.loggingService.log('Processing getHello request', 'getHello', {
      path: request.url,
    });

    const result = this.apiGatewayService.getHello();

    // Log the response
    this.loggingService.debug('Returning hello response', 'getHello', {
      response: result,
    });

    return result;
  }
}
