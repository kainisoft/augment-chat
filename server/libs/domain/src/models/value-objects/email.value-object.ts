import { InvalidEmailError } from '../../errors/invalid-email.error';

/**
 * Email Value Object
 *
 * Represents a valid email address in the system.
 * This is a shared implementation used across all services.
 */
export class Email {
  private readonly value: string;

  /**
   * Create a new Email value object
   * @param email - The email address string
   * @throws InvalidEmailError if the email is invalid
   */
  constructor(email: string) {
    this.validateEmail(email);
    this.value = email.toLowerCase();
  }

  /**
   * Validate the email format
   * @param email - The email address to validate
   * @throws InvalidEmailError if the email is invalid
   */
  private validateEmail(email: string): void {
    if (!email) {
      throw new InvalidEmailError('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailError(`Invalid email format: ${email}`);
    }
  }

  /**
   * Check if this email equals another email
   * @param email - The email to compare with
   * @returns True if the emails are equal, false otherwise
   */
  equals(email: Email): boolean {
    return this.value === email.value;
  }

  /**
   * Get the string representation of the email
   * @returns The email address as a string
   */
  toString(): string {
    return this.value;
  }
}
