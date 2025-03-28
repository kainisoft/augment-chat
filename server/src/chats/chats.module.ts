import { Module } from '@nestjs/common';
import { ChatsResolver } from './chats.resolver';
import { ChatsRepository } from './chats.repository';

@Module({
  imports: [],
  providers: [ChatsResolver, ChatsRepository],
})
export class ChatsModule {}
