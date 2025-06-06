import { MessageId } from '../value-objects/message-id.vo';
import { ConversationId } from '../value-objects/conversation-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { MessageContent } from '../value-objects/message-content.vo';

/**
 * Message Entity
 *
 * Domain entity representing a message in a conversation.
 */
export class Message {
  private readonly id: MessageId;
  private readonly conversationId: ConversationId;
  private readonly senderId: UserId;
  private content: MessageContent;
  private readonly messageType: 'text' | 'image' | 'file' | 'system';
  private readonly replyTo?: MessageId;
  private readonly attachments: string[];
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deliveredTo: UserId[];
  private readBy: UserId[];

  constructor(props: {
    id?: MessageId;
    conversationId: ConversationId;
    senderId: UserId;
    content: MessageContent;
    messageType?: 'text' | 'image' | 'file' | 'system';
    replyTo?: MessageId;
    attachments?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    deliveredTo?: UserId[];
    readBy?: UserId[];
  }) {
    this.id = props.id || MessageId.generate();
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.messageType = props.messageType || 'text';
    this.replyTo = props.replyTo;
    this.attachments = props.attachments || [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.deliveredTo = props.deliveredTo || [];
    this.readBy = props.readBy || [];
  }

  // Getters
  getId(): MessageId {
    return this.id;
  }

  getConversationId(): ConversationId {
    return this.conversationId;
  }

  getSenderId(): UserId {
    return this.senderId;
  }

  getContent(): MessageContent {
    return this.content;
  }

  getMessageType(): 'text' | 'image' | 'file' | 'system' {
    return this.messageType;
  }

  getReplyTo(): MessageId | undefined {
    return this.replyTo;
  }

  getAttachments(): string[] {
    return [...this.attachments];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeliveredTo(): UserId[] {
    return [...this.deliveredTo];
  }

  getReadBy(): UserId[] {
    return [...this.readBy];
  }

  // Business methods
  updateContent(content: MessageContent): void {
    this.content = content;
    this.updatedAt = new Date();
  }

  markAsDeliveredTo(userId: UserId): void {
    if (!this.deliveredTo.some((id) => id.equals(userId))) {
      this.deliveredTo.push(userId);
    }
  }

  markAsReadBy(userId: UserId): void {
    if (!this.readBy.some((id) => id.equals(userId))) {
      this.readBy.push(userId);
    }
    // Also mark as delivered
    this.markAsDeliveredTo(userId);
  }

  isDeliveredTo(userId: UserId): boolean {
    return this.deliveredTo.some((id) => id.equals(userId));
  }

  isReadBy(userId: UserId): boolean {
    return this.readBy.some((id) => id.equals(userId));
  }

  canBeEditedBy(userId: UserId): boolean {
    return this.senderId.equals(userId);
  }

  canBeDeletedBy(userId: UserId): boolean {
    return this.senderId.equals(userId);
  }
}
