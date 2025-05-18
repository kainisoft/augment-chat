import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * Relationship Status Enum
 *
 * Represents the possible statuses of a relationship.
 */
export enum RelationshipStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/**
 * RelationshipStatus Value Object
 *
 * Represents a relationship status in the system.
 */
export class RelationshipStatus {
  private readonly value: RelationshipStatusEnum;

  /**
   * Create a new RelationshipStatus value object
   * @param status - The relationship status
   */
  constructor(status: string | RelationshipStatusEnum) {
    this.validate(status);
    this.value = status as RelationshipStatusEnum;
  }

  /**
   * Validate the relationship status
   * @param status - The status to validate
   * @throws {ValueObjectError} If the status is invalid
   */
  private validate(status: string | RelationshipStatusEnum): void {
    const validStatuses = Object.values(RelationshipStatusEnum);

    if (!validStatuses.includes(status as RelationshipStatusEnum)) {
      throw new ValueObjectError(
        `Invalid relationship status. Must be one of: ${validStatuses.join(
          ', ',
        )}`,
        {
          valueObject: 'RelationshipStatus',
          providedValue: status,
          validValues: validStatuses,
        },
      );
    }
  }

  /**
   * Check if this relationship status equals another relationship status
   * @param status - The relationship status to compare with
   * @returns True if the relationship statuses are equal, false otherwise
   */
  equals(status: RelationshipStatus): boolean {
    return this.value === status.value;
  }

  /**
   * Get the string representation of the relationship status
   * @returns The relationship status as a string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Get the enum value of the relationship status
   * @returns The relationship status enum value
   */
  getValue(): RelationshipStatusEnum {
    return this.value;
  }
}
