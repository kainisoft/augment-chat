import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [UserServiceController, HealthController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
