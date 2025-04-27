import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { HealthController } from './health/health.controller';

@Module({
  controllers: [HealthController],
  providers: [CommonService],
  exports: [CommonService, HealthController],
})
export class CommonModule {}
