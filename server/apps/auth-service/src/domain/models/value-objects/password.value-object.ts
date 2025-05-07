import * as bcrypt from 'bcryptjs';
import { InvalidPasswordError } from '../../errors/invalid-password.error';

/**
 * Password Value Object
 *
 * Represents a user password in the system.
 */
export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  /**
   * Create a new Password value object
   * @param password - The password string
   * @param isHashed - Whether the password is already hashed (default: false)
   * @throws InvalidPasswordError if the password is invalid
   */
  constructor(password: string, isHashed = false) {
    if (!isHashed) {
      this.validatePassword(password);
    }
    this.value = password;
    this.isHashed = isHashed;
  }

  /**
   * Validate the password format
   * @param password - The password to validate
   * @throws InvalidPasswordError if the password is invalid
   */
  private validatePassword(password: string): void {
    if (!password) {
      throw new InvalidPasswordError('Password cannot be empty');
    }

    if (password.length < 8) {
      throw new InvalidPasswordError(
        'Password must be at least 8 characters long',
      );
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new InvalidPasswordError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      );
    }
  }

  /**
   * Check if this password equals another password
   * @param password - The password to compare with
   * @returns True if the passwords are equal, false otherwise
   */
  async compare(plainTextPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      return this.value === plainTextPassword;
    }
    return bcrypt.compare(plainTextPassword, this.value);
  }

  /**
   * Hash the password
   * @returns A new Password object with the hashed value
   */
  async hash(): Promise<Password> {
    if (this.isHashed) {
      return this;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.value, salt);
    return new Password(hashedPassword, true);
  }

  /**
   * Get the string representation of the password
   * @returns The password as a string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Check if the password is hashed
   * @returns True if the password is hashed, false otherwise
   */
  getIsHashed(): boolean {
    return this.isHashed;
  }
}
