import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * AuthId Value Object
 *
 * Represents an authentication ID from the Auth Service.
 */
export class AuthId {
  private readonly value: string;

  /**
   * Create a new AuthId value object
   * @param id - The authentication ID string
   */
  constructor(id: string) {
    this.validate(id);
    this.value = id;
  }

  /**
   * Validate the authentication ID
   * @param id - The ID to validate
   * @throws {ValueObjectError} If the ID is invalid
   */
  private validate(id: string): void {
    if (!id) {
      throw new ValueObjectError('Authentication ID cannot be empty', {
        valueObject: 'AuthId',
      });
    }

    // UUID validation regex
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValueObjectError('Invalid authentication ID format', {
        valueObject: 'AuthId',
        providedValue: id,
      });
    }
  }

  /**
   * Check if this authentication ID equals another authentication ID
   * @param id - The authentication ID to compare with
   * @returns True if the authentication IDs are equal, false otherwise
   */
  equals(id: AuthId): boolean {
    return this.value === id.value;
  }

  /**
   * Get the string representation of the authentication ID
   * @returns The authentication ID as a string
   */
  toString(): string {
    return this.value;
  }
}
