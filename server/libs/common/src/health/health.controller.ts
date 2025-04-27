import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: this.getServiceName(),
      uptime: process.uptime(),
    };
  }

  protected getServiceName(): string {
    return 'service';
  }
}
