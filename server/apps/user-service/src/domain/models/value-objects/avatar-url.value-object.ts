import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * AvatarUrl Value Object
 *
 * Represents a user's avatar URL in the system.
 */
export class AvatarUrl {
  private readonly value: string | null;

  /**
   * Create a new AvatarUrl value object
   * @param url - The avatar URL string (optional)
   */
  constructor(url?: string | null) {
    if (url !== undefined && url !== null) {
      this.validate(url);
      this.value = url;
    } else {
      this.value = null;
    }
  }

  /**
   * Validate the avatar URL
   * @param url - The URL to validate
   * @throws {ValueObjectError} If the URL is invalid
   */
  private validate(url: string): void {
    if (url.length > 255) {
      throw new ValueObjectError('Avatar URL cannot exceed 255 characters', {
        valueObject: 'AvatarUrl',
        providedValue: url,
        maxLength: 255,
      });
    }

    try {
      // Check if the URL is valid
      new URL(url);
    } catch (_) {
      throw new ValueObjectError('Invalid avatar URL format', {
        valueObject: 'AvatarUrl',
        providedValue: url,
      });
    }
  }

  /**
   * Check if this avatar URL equals another avatar URL
   * @param avatarUrl - The avatar URL to compare with
   * @returns True if the avatar URLs are equal, false otherwise
   */
  equals(avatarUrl: AvatarUrl): boolean {
    return this.value === avatarUrl.value;
  }

  /**
   * Check if the avatar URL is empty
   * @returns True if the avatar URL is empty or null, false otherwise
   */
  isEmpty(): boolean {
    return this.value === null || this.value === '';
  }

  /**
   * Get the string representation of the avatar URL
   * @returns The avatar URL as a string, or null if not set
   */
  toString(): string | null {
    return this.value;
  }
}
