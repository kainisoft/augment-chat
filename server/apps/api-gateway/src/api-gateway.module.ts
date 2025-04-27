import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import {
  HealthController,
  ApiGatewayHealthService
} from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [ApiGatewayController, HealthController],
  providers: [ApiGatewayService, ApiGatewayHealthService],
})
export class ApiGatewayModule {}
