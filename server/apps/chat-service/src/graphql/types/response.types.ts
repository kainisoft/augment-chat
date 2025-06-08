import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageReactionType } from './message.types';
import { UserPresenceType } from './input.types';

/**
 * Delete Message Response
 *
 * Response type for message deletion operations.
 */
@ObjectType({ description: 'Response for message deletion' })
export class DeleteMessageResponse {
  @Field(() => Boolean, { description: 'Whether the deletion was successful' })
  success: boolean;

  @Field(() => ID, { description: 'ID of the deleted message' })
  messageId: string;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if deletion failed',
  })
  error?: string;
}

/**
 * Delete Conversation Response
 *
 * Response type for conversation deletion operations.
 */
@ObjectType({ description: 'Response for conversation deletion' })
export class DeleteConversationResponse {
  @Field(() => Boolean, { description: 'Whether the deletion was successful' })
  success: boolean;

  @Field(() => ID, { description: 'ID of the deleted conversation' })
  conversationId: string;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if deletion failed',
  })
  error?: string;
}

/**
 * Add Reaction Response
 *
 * Response type for adding reactions to messages.
 */
@ObjectType({ description: 'Response for adding a reaction' })
export class AddReactionResponse {
  @Field(() => Boolean, {
    description: 'Whether the reaction was added successfully',
  })
  success: boolean;

  @Field(() => ID, {
    description: 'ID of the message the reaction was added to',
  })
  messageId: string;

  @Field(() => MessageReactionType, {
    nullable: true,
    description: 'The added reaction',
  })
  reaction?: MessageReactionType;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if adding reaction failed',
  })
  error?: string;
}

/**
 * Remove Reaction Response
 *
 * Response type for removing reactions from messages.
 */
@ObjectType({ description: 'Response for removing a reaction' })
export class RemoveReactionResponse {
  @Field(() => Boolean, {
    description: 'Whether the reaction was removed successfully',
  })
  success: boolean;

  @Field(() => ID, {
    description: 'ID of the message the reaction was removed from',
  })
  messageId: string;

  @Field(() => ID, {
    nullable: true,
    description: 'ID of the removed reaction',
  })
  reactionId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if removing reaction failed',
  })
  error?: string;
}

/**
 * Typing Status Response
 *
 * Response type for typing indicator operations.
 */
@ObjectType({ description: 'Response for typing status updates' })
export class TypingStatusResponse {
  @Field(() => Boolean, {
    description: 'Whether the typing status was updated successfully',
  })
  success: boolean;

  @Field(() => ID, { description: 'ID of the conversation' })
  conversationId: string;

  @Field(() => String, { description: 'User ID who is typing' })
  userId: string;

  @Field(() => Boolean, { description: 'Whether the user is currently typing' })
  isTyping: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if updating typing status failed',
  })
  error?: string;
}

/**
 * Message Status Update Response
 *
 * Response type for message status updates (read receipts, delivery confirmations).
 */
@ObjectType({ description: 'Response for message status updates' })
export class MessageStatusUpdateResponse {
  @Field(() => Boolean, {
    description: 'Whether the status update was successful',
  })
  success: boolean;

  @Field(() => ID, { description: 'ID of the message' })
  messageId: string;

  @Field(() => String, { description: 'Type of status update' })
  statusType: string; // 'delivered', 'read'

  @Field(() => String, { description: 'User ID who updated the status' })
  userId: string;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if status update failed',
  })
  error?: string;
}

/**
 * Typing Status Type
 *
 * Represents typing status for real-time subscriptions.
 */
@ObjectType({ description: 'Typing status for real-time updates' })
export class TypingStatusType {
  @Field(() => ID, { description: 'ID of the conversation' })
  conversationId: string;

  @Field(() => String, { description: 'User ID who is typing' })
  userId: string;

  @Field(() => String, { description: 'Display name of the user' })
  displayName: string;

  @Field(() => Boolean, { description: 'Whether the user is currently typing' })
  isTyping: boolean;

  @Field(() => Date, { description: 'Timestamp of the typing status' })
  timestamp: Date;
}

/**
 * Message Status Update Type
 *
 * Represents message status updates for real-time subscriptions.
 */
@ObjectType({ description: 'Message status update for real-time updates' })
export class MessageStatusUpdateType {
  @Field(() => ID, { description: 'ID of the message' })
  messageId: string;

  @Field(() => ID, { description: 'ID of the conversation' })
  conversationId: string;

  @Field(() => String, { description: 'Type of status update' })
  statusType: string; // 'delivered', 'read'

  @Field(() => String, { description: 'User ID who updated the status' })
  userId: string;

  @Field(() => Date, { description: 'Timestamp of the status update' })
  timestamp: Date;
}

/**
 * User Presence Response
 *
 * Response type for user presence operations.
 */
@ObjectType({ description: 'Response for user presence operations' })
export class UserPresenceResponse {
  @Field(() => Boolean, {
    description: 'Whether the presence update was successful',
  })
  success: boolean;

  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => UserPresenceType, { description: 'Current presence status' })
  status: UserPresenceType;

  @Field(() => String, {
    nullable: true,
    description: 'Custom status message',
  })
  statusMessage?: string;

  @Field(() => Date, { description: 'Last updated timestamp' })
  lastSeen: Date;

  @Field(() => String, {
    nullable: true,
    description: 'Error message if presence update failed',
  })
  error?: string;
}

/**
 * User Presence Info Type
 *
 * Represents user presence for real-time subscriptions and queries.
 */
@ObjectType({ description: 'User presence information' })
export class UserPresenceInfoType {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => UserPresenceType, { description: 'Current presence status' })
  status: UserPresenceType;

  @Field(() => String, {
    nullable: true,
    description: 'Custom status message',
  })
  statusMessage?: string;

  @Field(() => Date, { description: 'Last updated timestamp' })
  lastSeen: Date;

  @Field(() => Date, { description: 'When the presence was last updated' })
  updatedAt: Date;
}
