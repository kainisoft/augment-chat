import { Controller, Get, Req } from '@nestjs/common';
import {
  LoggingService,
  HttpLogMetadata,
  NotificationLogMetadata,
} from '@app/logging';
import { NotificationServiceService } from './notification-service.service';
import { FastifyRequest } from 'fastify';

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
  getHello(@Req() request: FastifyRequest): string {
    // Log the request using type-safe HTTP metadata
    const requestMetadata: HttpLogMetadata = {
      method: String(request.method),
      url: String(request.url),
      ip: String(request.ip || ''),
      userAgent: String(request.headers?.['user-agent'] || ''),
    };

    this.loggingService.log<HttpLogMetadata>(
      'Processing getHello request',
      'getHello',
      requestMetadata,
    );

    const result = this.notificationServiceService.getHello();

    // Log the response using type-safe notification metadata
    const responseMetadata: NotificationLogMetadata = {
      notificationType: 'api-response',
      channel: 'http',
      success: true,
    };

    this.loggingService.debug<NotificationLogMetadata>(
      'Returning hello response',
      'getHello',
      responseMetadata,
    );

    return result;
  }
}
