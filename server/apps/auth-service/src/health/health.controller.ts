import { Controller } from '@nestjs/common';
import { HealthController as BaseHealthController } from '@app/common';

@Controller('health')
export class HealthController extends BaseHealthController {
  protected getServiceName(): string {
    return 'auth-service';
  }
}
