import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageReactionType } from './message.types';

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
