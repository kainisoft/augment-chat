import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import {
  NotificationServiceHealthController,
  NotificationServiceHealthService
} from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [NotificationServiceController, NotificationServiceHealthController],
  providers: [NotificationServiceService, NotificationServiceHealthService],
})
export class NotificationServiceModule {}
