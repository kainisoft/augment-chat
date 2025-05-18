import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * Relationship Type Enum
 *
 * Represents the possible types of relationships between users.
 */
export enum RelationshipTypeEnum {
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED',
}

/**
 * RelationshipType Value Object
 *
 * Represents a relationship type in the system.
 */
export class RelationshipType {
  private readonly value: RelationshipTypeEnum;

  /**
   * Create a new RelationshipType value object
   * @param type - The relationship type
   */
  constructor(type: string | RelationshipTypeEnum) {
    this.validate(type);
    this.value = type as RelationshipTypeEnum;
  }

  /**
   * Validate the relationship type
   * @param type - The type to validate
   * @throws {ValueObjectError} If the type is invalid
   */
  private validate(type: string | RelationshipTypeEnum): void {
    const validTypes = Object.values(RelationshipTypeEnum);

    if (!validTypes.includes(type as RelationshipTypeEnum)) {
      throw new ValueObjectError(
        `Invalid relationship type. Must be one of: ${validTypes.join(', ')}`,
        {
          valueObject: 'RelationshipType',
          providedValue: type,
          validValues: validTypes,
        },
      );
    }
  }

  /**
   * Check if this relationship type equals another relationship type
   * @param type - The relationship type to compare with
   * @returns True if the relationship types are equal, false otherwise
   */
  equals(type: RelationshipType): boolean {
    return this.value === type.value;
  }

  /**
   * Get the string representation of the relationship type
   * @returns The relationship type as a string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get the enum value of the relationship type
   * @returns The relationship type enum value
   */
  getValue(): RelationshipTypeEnum {
    return this.value;
  }
}
