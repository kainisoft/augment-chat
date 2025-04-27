import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [AuthServiceController, HealthController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
