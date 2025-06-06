/**
 * Message Content Value Object
 *
 * Represents the content of a message with validation.
 */
export class MessageContent {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (value.length > 10000) {
      throw new Error('Message content cannot exceed 10000 characters');
    }
    this.value = value.trim();
  }

  toString(): string {
    return this.value;
  }

  equals(other: MessageContent): boolean {
    return this.value === other.value;
  }

  get length(): number {
    return this.value.length;
  }
}
