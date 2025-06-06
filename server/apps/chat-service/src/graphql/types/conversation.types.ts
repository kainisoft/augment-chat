import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLListResponse } from '@app/dtos/graphql/pagination-response.dto';
import { MessageType } from './message.types';

/**
 * Conversation Type Enum
 */
export enum ConversationTypeEnum {
  PRIVATE = 'private',
  GROUP = 'group',
}

/**
 * Register the ConversationType enum for GraphQL
 */
registerEnumType(ConversationTypeEnum, {
  name: 'ConversationTypeEnum',
  description: 'Conversation type options',
});

/**
 * Conversation Settings Type
 *
 * Represents settings for a conversation.
 */
@ObjectType({ description: 'Conversation settings' })
export class ConversationSettingsType {
  @Field(() => Boolean, { description: 'Whether notifications are enabled' })
  notifications: boolean;

  @Field(() => Date, {
    nullable: true,
    description: 'Mute notifications until this date',
  })
  muteUntil?: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Theme for the conversation',
  })
  theme?: string;
}

/**
 * Conversation Participant Type
 *
 * Represents a participant in a conversation with additional metadata.
 */
@ObjectType({ description: 'Conversation participant' })
export class ConversationParticipantType {
  @Field(() => String, { description: 'User ID of the participant' })
  userId: string;

  @Field(() => Date, { description: 'When the user joined the conversation' })
  joinedAt: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Role of the participant in group conversations',
  })
  role?: string;

  @Field(() => Boolean, {
    description: 'Whether the participant is currently active',
  })
  isActive: boolean;
}

/**
 * Conversation GraphQL Type
 *
 * Represents a conversation (private or group chat).
 */
@ObjectType({ description: 'Chat conversation' })
export class ConversationType {
  @Field(() => ID, { description: 'Unique identifier for the conversation' })
  id: string;

  @Field(() => ConversationTypeEnum, { description: 'Type of conversation' })
  type: ConversationTypeEnum;

  @Field(() => [String], {
    description: 'User IDs of conversation participants',
  })
  participants: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Name of the conversation (for group chats)',
  })
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Description of the conversation',
  })
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Avatar URL for the conversation',
  })
  avatar?: string;

  @Field(() => Date, { description: 'When the conversation was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the conversation was last updated' })
  updatedAt: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'When the last message was sent',
  })
  lastMessageAt?: Date;

  @Field(() => ID, {
    nullable: true,
    description: 'ID of the last message in the conversation',
  })
  lastMessageId?: string;

  @Field(() => ConversationSettingsType, {
    nullable: true,
    description: 'Conversation settings',
  })
  settings?: ConversationSettingsType;

  @Field(() => MessageType, {
    nullable: true,
    description: 'The last message in the conversation',
  })
  lastMessage?: MessageType;

  @Field(() => Number, {
    description: 'Number of unread messages for the current user',
    defaultValue: 0,
  })
  unreadCount: number;

  @Field(() => Number, {
    description: 'Total number of messages in the conversation',
    defaultValue: 0,
  })
  messageCount: number;
}

/**
 * Conversation Connection (for pagination)
 *
 * Extends the shared GraphQL list response for consistency.
 */
@ObjectType({ description: 'Paginated list of conversations' })
export class ConversationConnection extends GraphQLListResponse<ConversationType> {
  @Field(() => [ConversationType], { description: 'List of conversations' })
  items: ConversationType[];
}

/**
 * Conversation Summary Type
 *
 * Lightweight version of conversation for list views.
 */
@ObjectType({ description: 'Conversation summary for list views' })
export class ConversationSummaryType {
  @Field(() => ID, { description: 'Unique identifier for the conversation' })
  id: string;

  @Field(() => ConversationTypeEnum, { description: 'Type of conversation' })
  type: ConversationTypeEnum;

  @Field(() => String, {
    nullable: true,
    description: 'Display name for the conversation',
  })
  displayName?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Avatar URL for the conversation',
  })
  avatar?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Preview of the last message',
  })
  lastMessagePreview?: string;

  @Field(() => Date, {
    nullable: true,
    description: 'When the last message was sent',
  })
  lastMessageAt?: Date;

  @Field(() => Number, {
    description: 'Number of unread messages',
    defaultValue: 0,
  })
  unreadCount: number;

  @Field(() => Boolean, {
    description: 'Whether the conversation is muted',
  })
  isMuted: boolean;
}
