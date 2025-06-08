import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ConversationTypeEnum } from './conversation.types';
import { MessageTypeEnum } from './message.types';

/**
 * User Presence Type Enum
 */
export enum UserPresenceType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy',
}

/**
 * Register the UserPresenceType enum for GraphQL
 */
registerEnumType(UserPresenceType, {
  name: 'UserPresenceType',
  description: 'User presence status options',
});

/**
 * Send Message Input
 *
 * Input type for sending a new message.
 */
@InputType({ description: 'Input for sending a new message' })
export class SendMessageInput {
  @Field(() => ID, { description: 'Conversation ID to send the message to' })
  @IsString()
  conversationId: string;

  @Field(() => String, { description: 'Message content' })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @Field(() => MessageTypeEnum, {
    description: 'Type of message',
    defaultValue: MessageTypeEnum.TEXT,
  })
  @IsEnum(MessageTypeEnum)
  @IsOptional()
  messageType?: MessageTypeEnum;

  @Field(() => ID, {
    nullable: true,
    description: 'Message ID this is replying to',
  })
  @IsString()
  @IsOptional()
  replyTo?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Attachment URLs',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

/**
 * Update Message Input
 *
 * Input type for updating an existing message.
 */
@InputType({ description: 'Input for updating a message' })
export class UpdateMessageInput {
  @Field(() => String, { description: 'New message content' })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;
}

/**
 * Create Conversation Input
 *
 * Input type for creating a new conversation.
 */
@InputType({ description: 'Input for creating a new conversation' })
export class CreateConversationInput {
  @Field(() => ConversationTypeEnum, { description: 'Type of conversation' })
  @IsEnum(ConversationTypeEnum)
  type: ConversationTypeEnum;

  @Field(() => [String], { description: 'User IDs of participants' })
  @IsArray()
  @IsString({ each: true })
  participants: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Name for group conversations',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Description for group conversations',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Avatar URL for the conversation',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}

/**
 * Update Conversation Input
 *
 * Input type for updating conversation details.
 */
@InputType({ description: 'Input for updating a conversation' })
export class UpdateConversationInput {
  @Field(() => String, {
    nullable: true,
    description: 'New name for the conversation',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'New description for the conversation',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'New avatar URL for the conversation',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}

/**
 * Add Participants Input
 *
 * Input type for adding participants to a conversation.
 */
@InputType({ description: 'Input for adding participants to a conversation' })
export class AddParticipantsInput {
  @Field(() => [String], { description: 'User IDs to add as participants' })
  @IsArray()
  @IsString({ each: true })
  participants: string[];
}

/**
 * Remove Participants Input
 *
 * Input type for removing participants from a conversation.
 */
@InputType({
  description: 'Input for removing participants from a conversation',
})
export class RemoveParticipantsInput {
  @Field(() => [String], {
    description: 'User IDs to remove from participants',
  })
  @IsArray()
  @IsString({ each: true })
  participants: string[];
}

/**
 * Add Reaction Input
 *
 * Input type for adding a reaction to a message.
 */
@InputType({ description: 'Input for adding a reaction to a message' })
export class AddReactionInput {
  @Field(() => String, { description: 'Emoji for the reaction' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  emoji: string;
}

/**
 * Conversation Settings Input
 *
 * Input type for updating conversation settings.
 */
@InputType({ description: 'Input for updating conversation settings' })
export class ConversationSettingsInput {
  @Field(() => Boolean, {
    nullable: true,
    description: 'Whether to enable notifications',
  })
  @IsBoolean()
  @IsOptional()
  notifications?: boolean;

  @Field(() => Date, {
    nullable: true,
    description: 'Mute notifications until this date',
  })
  @IsOptional()
  muteUntil?: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Theme for the conversation',
  })
  @IsString()
  @IsOptional()
  theme?: string;
}

/**
 * Mark Messages Read Input
 *
 * Input type for marking messages as read.
 */
@InputType({ description: 'Input for marking messages as read' })
export class MarkMessagesReadInput {
  @Field(() => [ID], { description: 'Message IDs to mark as read' })
  @IsArray()
  @IsString({ each: true })
  messageIds: string[];
}

/**
 * Mark Message Delivered Input
 *
 * Input type for marking a single message as delivered.
 */
@InputType({ description: 'Input for marking a message as delivered' })
export class MarkMessageDeliveredInput {
  @Field(() => ID, { description: 'Message ID to mark as delivered' })
  @IsString()
  messageId: string;
}

/**
 * Mark Message Read Input
 *
 * Input type for marking a single message as read.
 */
@InputType({ description: 'Input for marking a message as read' })
export class MarkMessageReadInput {
  @Field(() => ID, { description: 'Message ID to mark as read' })
  @IsString()
  messageId: string;
}

/**
 * Start Typing Input
 *
 * Input type for starting typing indicator in a conversation.
 */
@InputType({ description: 'Input for starting typing indicator' })
export class StartTypingInput {
  @Field(() => ID, { description: 'Conversation ID where user is typing' })
  @IsString()
  conversationId: string;
}

/**
 * Stop Typing Input
 *
 * Input type for stopping typing indicator in a conversation.
 */
@InputType({ description: 'Input for stopping typing indicator' })
export class StopTypingInput {
  @Field(() => ID, { description: 'Conversation ID where user stopped typing' })
  @IsString()
  conversationId: string;
}

/**
 * Update Presence Input
 *
 * Input type for updating user presence status.
 */
@InputType({ description: 'Input for updating user presence status' })
export class UpdatePresenceInput {
  @Field(() => UserPresenceType, { description: 'New presence status' })
  @IsEnum(UserPresenceType)
  status: UserPresenceType;

  @Field({ description: 'Optional custom status message', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  statusMessage?: string;
}
