import { UserId, Email } from '@app/domain';
import { Password } from './value-objects/password.value-object';

/**
 * User Entity Props
 *
 * Properties required to create a User entity.
 */
export interface UserProps {
  id?: UserId;
  email: Email;
  password: Password;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
}

/**
 * User Entity
 *
 * Represents a user in the authentication system.
 */
export class User {
  private readonly id: UserId;
  private email: Email;
  private password: Password;
  private isActive: boolean;
  private isVerified: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private lastLoginAt: Date | null;
  private failedLoginAttempts: number;
  private lockedUntil: Date | null;

  /**
   * Create a new User entity
   * @param props - The user properties
   */
  constructor(props: UserProps) {
    this.id = props.id || new UserId();
    this.email = props.email;
    this.password = props.password;
    this.isActive = props.isActive ?? true;
    this.isVerified = props.isVerified ?? false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.lastLoginAt = props.lastLoginAt || null;
    this.failedLoginAttempts = props.failedLoginAttempts ?? 0;
    this.lockedUntil = props.lockedUntil || null;
  }

  /**
   * Get the user ID
   * @returns The user ID
   */
  getId(): UserId {
    return this.id;
  }

  /**
   * Get the user email
   * @returns The user email
   */
  getEmail(): Email {
    return this.email;
  }

  /**
   * Update the user email
   * @param email - The new email
   */
  updateEmail(email: Email): void {
    this.email = email;
    this.updatedAt = new Date();
  }

  /**
   * Get the user password
   * @returns The user password
   */
  getPassword(): Password {
    return this.password;
  }

  /**
   * Update the user password
   * @param password - The new password
   */
  updatePassword(password: Password): void {
    this.password = password;
    this.updatedAt = new Date();
  }

  /**
   * Check if the user is active
   * @returns True if the user is active, false otherwise
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Set the user active status
   * @param isActive - The new active status
   */
  setIsActive(isActive: boolean): void {
    this.isActive = isActive;
    this.updatedAt = new Date();
  }

  /**
   * Check if the user is verified
   * @returns True if the user is verified, false otherwise
   */
  getIsVerified(): boolean {
    return this.isVerified;
  }

  /**
   * Set the user verified status
   * @param isVerified - The new verified status
   */
  setIsVerified(isVerified: boolean): void {
    this.isVerified = isVerified;
    this.updatedAt = new Date();
  }

  /**
   * Get the user creation date
   * @returns The user creation date
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Get the user last update date
   * @returns The user last update date
   */
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Get the user last login date
   * @returns The user last login date
   */
  getLastLoginAt(): Date | null {
    return this.lastLoginAt;
  }

  /**
   * Update the user last login date
   */
  updateLastLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update the user last login time
   * Alias for updateLastLogin for better readability
   */
  updateLastLoginTime(): void {
    this.updateLastLogin();
  }

  /**
   * Get the number of failed login attempts
   * @returns The number of failed login attempts
   */
  getFailedLoginAttempts(): number {
    return this.failedLoginAttempts;
  }

  /**
   * Increment the failed login attempts counter
   */
  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;
    this.updatedAt = new Date();
  }

  /**
   * Reset the failed login attempts counter
   */
  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.updatedAt = new Date();
  }

  /**
   * Get the date until which the account is locked
   * @returns The lock expiration date or null if not locked
   */
  getLockedUntil(): Date | null {
    return this.lockedUntil;
  }

  /**
   * Check if the account is locked
   * @returns True if the account is locked, false otherwise
   */
  isLocked(): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return this.lockedUntil > new Date();
  }

  /**
   * Lock the account until the specified date
   * @param until - The date until which to lock the account
   */
  lockUntil(until: Date): void {
    this.lockedUntil = until;
    this.updatedAt = new Date();
  }

  /**
   * Unlock the account
   */
  unlock(): void {
    this.lockedUntil = null;
    this.resetFailedLoginAttempts();
    this.updatedAt = new Date();
  }
}
