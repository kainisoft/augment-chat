import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggingServiceService {
  getHello(): string {
    return 'Logging Service is running. Use /logs to view logs and /health to check service status.';
  }
}
