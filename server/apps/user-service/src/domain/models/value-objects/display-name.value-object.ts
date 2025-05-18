import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * DisplayName Value Object
 *
 * Represents a user's display name in the system.
 */
export class DisplayName {
  private readonly value: string;

  /**
   * Create a new DisplayName value object
   * @param displayName - The display name string
   */
  constructor(displayName: string) {
    this.validate(displayName);
    this.value = displayName;
  }

  /**
   * Validate the display name
   * @param displayName - The display name to validate
   * @throws {ValueObjectError} If the display name is invalid
   */
  private validate(displayName: string): void {
    if (!displayName) {
      throw new ValueObjectError('Display name cannot be empty', {
        valueObject: 'DisplayName',
      });
    }

    if (displayName.length > 100) {
      throw new ValueObjectError('Display name cannot exceed 100 characters', {
        valueObject: 'DisplayName',
        providedValue: displayName,
        maxLength: 100,
      });
    }
  }

  /**
   * Check if this display name equals another display name
   * @param displayName - The display name to compare with
   * @returns True if the display names are equal, false otherwise
   */
  equals(displayName: DisplayName): boolean {
    return this.value === displayName.value;
  }

  /**
   * Get the string representation of the display name
   * @returns The display name as a string
   */
  toString(): string {
    return this.value;
  }
}
