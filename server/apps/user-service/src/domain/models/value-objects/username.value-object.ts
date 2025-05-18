import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * Username Value Object
 *
 * Represents a username in the system.
 */
export class Username {
  private readonly value: string;

  /**
   * Create a new Username value object
   * @param username - The username string
   */
  constructor(username: string) {
    this.validate(username);
    this.value = username;
  }

  /**
   * Validate the username
   * @param username - The username to validate
   * @throws {ValueObjectError} If the username is invalid
   */
  private validate(username: string): void {
    if (!username) {
      throw new ValueObjectError('Username cannot be empty', {
        valueObject: 'Username',
      });
    }

    if (username.length < 3) {
      throw new ValueObjectError(
        'Username must be at least 3 characters long',
        {
          valueObject: 'Username',
          providedValue: username,
          minLength: 3,
        },
      );
    }

    if (username.length > 50) {
      throw new ValueObjectError('Username cannot exceed 50 characters', {
        valueObject: 'Username',
        providedValue: username,
        maxLength: 50,
      });
    }

    // Username can only contain alphanumeric characters, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      throw new ValueObjectError(
        'Username can only contain letters, numbers, underscores, and hyphens',
        {
          valueObject: 'Username',
          providedValue: username,
          pattern: usernameRegex.toString(),
        },
      );
    }
  }

  /**
   * Check if this username equals another username
   * @param username - The username to compare with
   * @returns True if the usernames are equal, false otherwise
   */
  equals(username: Username): boolean {
    return this.value.toLowerCase() === username.value.toLowerCase();
  }

  /**
   * Get the string representation of the username
   * @returns The username as a string
   */
  toString(): string {
    return this.value;
  }
}
