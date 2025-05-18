import { ValueObjectError } from '@app/common/errors/domain/business-error';

/**
 * User Status Enum
 *
 * Represents the possible statuses of a user.
 */
export enum UserStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  DO_NOT_DISTURB = 'DO_NOT_DISTURB',
}

/**
 * UserStatus Value Object
 *
 * Represents a user's status in the system.
 */
export class UserStatus {
  private readonly value: UserStatusEnum;

  /**
   * Create a new UserStatus value object
   * @param status - The user status (defaults to OFFLINE)
   */
  constructor(status: string | UserStatusEnum = UserStatusEnum.OFFLINE) {
    this.validate(status);
    this.value = status as UserStatusEnum;
  }

  /**
   * Validate the user status
   * @param status - The status to validate
   * @throws {ValueObjectError} If the status is invalid
   */
  private validate(status: string | UserStatusEnum): void {
    const validStatuses = Object.values(UserStatusEnum);

    if (!validStatuses.includes(status as UserStatusEnum)) {
      throw new ValueObjectError(
        `Invalid user status. Must be one of: ${validStatuses.join(', ')}`,
        {
          valueObject: 'UserStatus',
          providedValue: status,
          validValues: validStatuses,
        },
      );
    }
  }

  /**
   * Check if this user status equals another user status
   * @param status - The user status to compare with
   * @returns True if the user statuses are equal, false otherwise
   */
  equals(status: UserStatus): boolean {
    return this.value === status.value;
  }

  /**
   * Check if the user is online
   * @returns True if the user is online, false otherwise
   */
  isOnline(): boolean {
    return this.value === UserStatusEnum.ONLINE;
  }

  /**
   * Check if the user is offline
   * @returns True if the user is offline, false otherwise
   */
  isOffline(): boolean {
    return this.value === UserStatusEnum.OFFLINE;
  }

  /**
   * Check if the user is away
   * @returns True if the user is away, false otherwise
   */
  isAway(): boolean {
    return this.value === UserStatusEnum.AWAY;
  }

  /**
   * Check if the user is in do not disturb mode
   * @returns True if the user is in do not disturb mode, false otherwise
   */
  isDoNotDisturb(): boolean {
    return this.value === UserStatusEnum.DO_NOT_DISTURB;
  }

  /**
   * Get the enum value of the user status
   * @returns The user status enum value
   */
  getValue(): UserStatusEnum {
    return this.value;
  }

  /**
   * Get the string representation of the user status
   * @returns The user status as a string
   */
  toString(): string {
    return this.value;
  }
}
