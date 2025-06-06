import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLListResponse } from '@app/dtos/graphql/pagination-response.dto';

/**
 * Message Type Enum
 */
export enum MessageTypeEnum {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

/**
 * Register the MessageType enum for GraphQL
 */
registerEnumType(MessageTypeEnum, {
  name: 'MessageTypeEnum',
  description: 'Message type options',
});

/**
 * Message Edit History Type
 *
 * Represents the edit history of a message.
 */
@ObjectType({ description: 'Message edit history entry' })
export class MessageEditHistoryType {
  @Field(() => String, { description: 'Previous content of the message' })
  content: string;

  @Field(() => Date, { description: 'When the message was edited' })
  editedAt: Date;

  @Field(() => String, { description: 'User ID who edited the message' })
  editedBy: string;
}

/**
 * Message Attachment Type
 *
 * Represents a file attachment in a message.
 */
@ObjectType({ description: 'Message file attachment' })
export class MessageAttachmentType {
  @Field(() => ID, { description: 'Unique identifier for the attachment' })
  id: string;

  @Field(() => String, { description: 'File name' })
  fileName: string;

  @Field(() => String, { description: 'Original file name' })
  originalName: string;

  @Field(() => String, { description: 'MIME type of the file' })
  fileType: string;

  @Field(() => Number, { description: 'File size in bytes' })
  fileSize: number;

  @Field(() => String, { description: 'URL to access the file' })
  storageUrl: string;

  @Field(() => String, { nullable: true, description: 'URL to file thumbnail' })
  thumbnailUrl?: string;

  @Field(() => Date, { description: 'When the attachment was uploaded' })
  createdAt: Date;
}

/**
 * Message Reaction Type
 *
 * Represents a reaction to a message.
 */
@ObjectType({ description: 'Message reaction' })
export class MessageReactionType {
  @Field(() => ID, { description: 'Unique identifier for the reaction' })
  id: string;

  @Field(() => String, { description: 'User ID who reacted' })
  userId: string;

  @Field(() => String, { description: 'Emoji used for the reaction' })
  emoji: string;

  @Field(() => Date, { description: 'When the reaction was added' })
  createdAt: Date;
}

/**
 * Message GraphQL Type
 *
 * Represents a message in a conversation.
 */
@ObjectType({ description: 'Chat message' })
export class MessageType {
  @Field(() => ID, { description: 'Unique identifier for the message' })
  id: string;

  @Field(() => ID, { description: 'Conversation this message belongs to' })
  conversationId: string;

  @Field(() => String, { description: 'User ID who sent the message' })
  senderId: string;

  @Field(() => String, { description: 'Message content' })
  content: string;

  @Field(() => [MessageAttachmentType], {
    nullable: true,
    description: 'File attachments in the message',
  })
  attachments?: MessageAttachmentType[];

  @Field(() => Date, { description: 'When the message was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the message was last updated' })
  updatedAt: Date;

  @Field(() => [String], {
    nullable: true,
    description: 'User IDs who have received the message',
  })
  deliveredTo?: string[];

  @Field(() => [String], {
    nullable: true,
    description: 'User IDs who have read the message',
  })
  readBy?: string[];

  @Field(() => [MessageEditHistoryType], {
    nullable: true,
    description: 'Edit history of the message',
  })
  editHistory?: MessageEditHistoryType[];

  @Field(() => [MessageReactionType], {
    nullable: true,
    description: 'Reactions to the message',
  })
  reactions?: MessageReactionType[];

  @Field(() => ID, {
    nullable: true,
    description: 'Message this is replying to',
  })
  replyTo?: string;

  @Field(() => MessageTypeEnum, { description: 'Type of the message' })
  messageType: MessageTypeEnum;
}

/**
 * Message Connection (for pagination)
 *
 * Extends the shared GraphQL list response for consistency.
 */
@ObjectType({ description: 'Paginated list of messages' })
export class MessageConnection extends GraphQLListResponse<MessageType> {
  @Field(() => [MessageType], { description: 'List of messages' })
  items: MessageType[];
}
