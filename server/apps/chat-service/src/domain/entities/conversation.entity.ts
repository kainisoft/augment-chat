import { ConversationId } from '../value-objects/conversation-id.vo';
import { MessageId } from '../value-objects/message-id.vo';
import { UserId } from '../value-objects/user-id.vo';

/**
 * Conversation Entity
 *
 * Domain entity representing a conversation (private or group).
 */
export class Conversation {
  private readonly id: ConversationId;
  private readonly type: 'private' | 'group';
  private participants: UserId[];
  private name?: string;
  private description?: string;
  private avatar?: string;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private lastMessageAt?: Date;
  private lastMessageId?: MessageId;

  constructor(props: {
    id?: ConversationId;
    type: 'private' | 'group';
    participants: UserId[];
    name?: string;
    description?: string;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
    lastMessageAt?: Date;
    lastMessageId?: MessageId;
  }) {
    this.id = props.id || ConversationId.generate();
    this.type = props.type;
    this.participants = props.participants;
    this.name = props.name;
    this.description = props.description;
    this.avatar = props.avatar;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.lastMessageAt = props.lastMessageAt;
    this.lastMessageId = props.lastMessageId;

    this.validateConversation();
  }

  // Getters
  getId(): ConversationId {
    return this.id;
  }

  getType(): 'private' | 'group' {
    return this.type;
  }

  getParticipants(): UserId[] {
    return [...this.participants];
  }

  getName(): string | undefined {
    return this.name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getAvatar(): string | undefined {
    return this.avatar;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getLastMessageAt(): Date | undefined {
    return this.lastMessageAt;
  }

  getLastMessageId(): MessageId | undefined {
    return this.lastMessageId;
  }

  // Business methods
  isParticipant(userId: UserId): boolean {
    return this.participants.some((participant) => participant.equals(userId));
  }

  addParticipant(userId: UserId): void {
    if (this.type === 'private') {
      throw new Error('Cannot add participants to private conversations');
    }
    if (!this.isParticipant(userId)) {
      this.participants.push(userId);
      this.updatedAt = new Date();
    }
  }

  removeParticipant(userId: UserId): void {
    if (this.type === 'private') {
      throw new Error('Cannot remove participants from private conversations');
    }
    this.participants = this.participants.filter(
      (participant) => !participant.equals(userId),
    );
    this.updatedAt = new Date();
  }

  updateName(name: string): void {
    if (this.type === 'private') {
      throw new Error('Cannot set name for private conversations');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (this.type === 'private') {
      throw new Error('Cannot set description for private conversations');
    }
    this.description = description;
    this.updatedAt = new Date();
  }

  updateAvatar(avatar: string): void {
    this.avatar = avatar;
    this.updatedAt = new Date();
  }

  updateLastMessage(messageId: MessageId, timestamp: Date): void {
    this.lastMessageId = messageId;
    this.lastMessageAt = timestamp;
    this.updatedAt = new Date();
  }

  private validateConversation(): void {
    if (this.participants.length < 1) {
      throw new Error('Conversation must have at least one participant');
    }

    if (this.type === 'private' && this.participants.length !== 2) {
      throw new Error('Private conversations must have exactly 2 participants');
    }

    if (this.type === 'private' && (this.name || this.description)) {
      throw new Error('Private conversations cannot have name or description');
    }
  }
}
