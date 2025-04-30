import { Controller, Get } from '@nestjs/common';
import { LoggingServiceService } from './logging-service.service';

@Controller()
export class LoggingServiceController {
  constructor(private readonly loggingServiceService: LoggingServiceService) {}

  @Get()
  getHello(): string {
    return this.loggingServiceService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('logs')
  getLogs(): { message: string } {
    return {
      message: 'Logging service is running. No logs available yet.',
    };
  }
}
