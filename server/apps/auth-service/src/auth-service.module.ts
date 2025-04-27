import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import {
  AuthServiceHealthController,
  AuthServiceHealthService
} from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [AuthServiceController, AuthServiceHealthController],
  providers: [AuthServiceService, AuthServiceHealthService],
})
export class AuthServiceModule {}
