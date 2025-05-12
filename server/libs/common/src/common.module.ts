import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { ErrorLoggerService } from './errors/services/error-logger.service';

@Module({
  providers: [CommonService, ErrorLoggerService],
  exports: [CommonService, ErrorLoggerService],
})
export class CommonModule {}
