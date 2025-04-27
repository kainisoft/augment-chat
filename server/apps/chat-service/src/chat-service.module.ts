import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';
import {
  ChatServiceHealthController,
  ChatServiceHealthService
} from './health/health.controller';

@Module({
  imports: [CommonModule],
  controllers: [ChatServiceController, ChatServiceHealthController],
  providers: [ChatServiceService, ChatServiceHealthService],
})
export class ChatServiceModule {}
