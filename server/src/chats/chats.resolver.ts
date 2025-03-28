import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { ChatsRepository } from './chats.repository';
import { CreateChatInput } from './dto/create-chat.input';
import { SendMessageInput } from './dto/send-message.input';
import { Chat } from './models/chat.model';
import { Message } from './models/message.model';

@Resolver(() => Chat)
export class ChatsResolver {
  private pubSub = new PubSub();

  constructor(private readonly chatsRepository: ChatsRepository) {}

  @Query(() => [Chat])
  async getChats(@CurrentUser() userId: string) {
    return this.chatsRepository.getUserChats(userId);
  }

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

  @Mutation(() => Chat)
  async createChat(@CurrentUser() userId: string, @Args('input') input: CreateChatInput) {
    const chat = await this.chatsRepository.createChat({
      name: input.name,
      isGroup: input.isGroup,
      createdBy: userId,
      memberIds: [...new Set([userId, ...input.memberIds])],
    });

    return chat;
  }

  @Mutation(() => Message)
  async sendMessage(@CurrentUser() userId: string, @Args('input') input: SendMessageInput) {
    const message = await this.chatsRepository.addMessage({
      chatId: input.chatId,
      userId,
      content: input.content,
      type: input.type || 'text',
      metadata: input.metadata,
    });

    await this.pubSub.publish(`chat:${input.chatId}:messageCreated`, {
      messageCreated: message,
    });

    return message;
  }

  @Mutation(() => Boolean)
  async markMessagesAsRead(@CurrentUser() userId: string, @Args('chatId') chatId: string) {
    await this.chatsRepository.markMessagesAsRead(chatId, userId);

    return true;
  }

  @Subscription(() => Message, {
    filter: (payload: { messageCreated: Message }, variables: { chatId: string }) =>
      payload.messageCreated.chatId === variables.chatId,
  })
  messageCreated(@Args('chatId') chatId: string) {
    return this.pubSub.asyncIterableIterator(`chat:${chatId}:messageCreated`);
  }
}
