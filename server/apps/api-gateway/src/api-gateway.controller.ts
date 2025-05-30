import { Controller, Get, Req } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { ApiGatewayService } from './api-gateway.service';
import { FastifyRequest } from 'fastify';

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
  getHello(@Req() request: FastifyRequest): string {
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
