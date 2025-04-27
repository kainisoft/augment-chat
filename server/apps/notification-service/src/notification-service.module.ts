import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [NotificationServiceController, HealthController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
