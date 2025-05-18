import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * Bio Value Object
 *
 * Represents a user's biography in the system.
 */
export class Bio {
  private readonly value: string | null;

  /**
   * Create a new Bio value object
   * @param bio - The bio string (optional)
   */
  constructor(bio?: string | null) {
    if (bio !== undefined && bio !== null) {
      this.validate(bio);
      this.value = bio;
    } else {
      this.value = null;
    }
  }

  /**
   * Validate the bio
   * @param bio - The bio to validate
   * @throws {ValueObjectError} If the bio is invalid
   */
  private validate(bio: string): void {
    if (bio.length > 500) {
      throw new ValueObjectError('Bio cannot exceed 500 characters', {
        valueObject: 'Bio',
        providedValue: bio,
        maxLength: 500,
      });
    }
  }

  /**
   * Check if this bio equals another bio
   * @param bio - The bio to compare with
   * @returns True if the bios are equal, false otherwise
   */
  equals(bio: Bio): boolean {
    return this.value === bio.value;
  }

  /**
   * Check if the bio is empty
   * @returns True if the bio is empty or null, false otherwise
   */
  isEmpty(): boolean {
    return this.value === null || this.value === '';
  }

  /**
   * Get the string representation of the bio
   * @returns The bio as a string, or null if not set
   */
  toString(): string | null {
    return this.value;
  }
}
