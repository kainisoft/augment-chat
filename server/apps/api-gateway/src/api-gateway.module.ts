import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import {
  ApiGatewayHealthController,
  ApiGatewayHealthService
} from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [ApiGatewayController, ApiGatewayHealthController],
  providers: [ApiGatewayService, ApiGatewayHealthService],
})
export class ApiGatewayModule {}
