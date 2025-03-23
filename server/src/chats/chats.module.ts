import { Module } from '@nestjs/common';
import { ChatsRepository } from './chats.repository';
import { ChatsResolver } from './chats.resolver';

@Module({
  providers: [ChatsResolver, ChatsRepository],
})
export class ChatsModule {}
