import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [ChatServiceController, HealthController],
  providers: [ChatServiceService],
})
export class ChatServiceModule {}
