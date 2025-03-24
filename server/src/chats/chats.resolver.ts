import { Args, Query, Resolver } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { ChatsRepository } from './chats.repository';
import { Message } from './models/message.model';

@Resolver('Chat')
export class ChatsResolver {
  private pubSub = new PubSub();

  constructor(private readonly chatsRepository: ChatsRepository) {}

  @Query(() => [Message])
  async getMessages(
    @Args('chatId') chatId: string,
    @Args('limit') limit: number,
    @Args('before') before?: string,
  ) {
    return this.chatsRepository.getChatMessages(
      chatId,
      limit,
      before ? new Date(before) : undefined,
    );
  }

  // @Mutation()
  // async sendMessage(
  //   @Args('chatId') chatId: string,
  //   @Args('userId') userId: string,
  //   @Args('content') content: string,
  // ) {
  //   const message = await this.chatsRepository.addMessage({
  //     chatId,
  //     userId,
  //     content,
  //   });

  //   await this.pubSub.publish('messageAdded', { messageAdded: message });

  //   return message;
  // }

  // @Subscription()
  // messageAdded() {
  //   return this.pubSub.asyncIterableIterator('messageAdded');
  // }
}
