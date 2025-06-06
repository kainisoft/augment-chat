import { ObjectId } from 'mongodb';

/**
 * Conversation ID Value Object
 *
 * Represents a unique identifier for a conversation.
 */
export class ConversationId {
  private readonly value: ObjectId;

  constructor(value: string | ObjectId) {
    if (typeof value === 'string') {
      if (!ObjectId.isValid(value)) {
        throw new Error(`Invalid conversation ID: ${value}`);
      }
      this.value = new ObjectId(value);
    } else {
      this.value = value;
    }
  }

  toString(): string {
    return this.value.toString();
  }

  toObjectId(): ObjectId {
    return this.value;
  }

  equals(other: ConversationId): boolean {
    return this.value.equals(other.value);
  }

  static generate(): ConversationId {
    return new ConversationId(new ObjectId());
  }
}
