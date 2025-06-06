import { ObjectId } from 'mongodb';

/**
 * Message ID Value Object
 *
 * Represents a unique identifier for a message.
 */
export class MessageId {
  private readonly value: ObjectId;

  constructor(value: string | ObjectId) {
    if (typeof value === 'string') {
      if (!ObjectId.isValid(value)) {
        throw new Error(`Invalid message ID: ${value}`);
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

  equals(other: MessageId): boolean {
    return this.value.equals(other.value);
  }

  static generate(): MessageId {
    return new MessageId(new ObjectId());
  }
}
