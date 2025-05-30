import { Injectable } from '@nestjs/common';
import { StringValidator, StringManipulator, DateValidator } from '@app/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Validation Service
 *
 * Provides utility methods for validation operations across microservices.
 * This service includes common validation patterns and utilities that can
 * be reused across different services.
 */
@Injectable()
export class ValidationService {
  /**
   * Validate a DTO object and return formatted errors
   *
   * @param dtoClass - The DTO class to validate against
   * @param data - The data to validate
   * @returns Promise resolving to validation errors or empty array
   */
  async validateDto<T extends object>(
    dtoClass: new () => T,
    data: any,
  ): Promise<ValidationError[]> {
    const dto = plainToClass(dtoClass, data);
    return validate(dto);
  }

  /**
   * Format validation errors into a user-friendly format
   *
   * @param errors - Array of validation errors
   * @returns Formatted error messages
   */
  formatValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        messages.push(...this.formatValidationErrors(error.children));
      }
    }

    return messages;
  }

  /**
   * Validate UUID v4 format
   *
   * @param uuid - The UUID string to validate
   * @returns True if valid UUID v4, false otherwise
   */
  isValidUUIDv4(uuid: string): boolean {
    return StringValidator.isValidUUID(uuid);
  }

  /**
   * Validate email format
   *
   * @param email - The email string to validate
   * @returns True if valid email format, false otherwise
   */
  isValidEmail(email: string): boolean {
    return StringValidator.isValidEmail(email);
  }

  /**
   * Validate username format
   *
   * @param username - The username string to validate
   * @returns True if valid username format, false otherwise
   */
  isValidUsername(username: string): boolean {
    if (!username || username.length < 3 || username.length > 50) {
      return false;
    }
    return StringValidator.isValidUsername(username);
  }

  /**
   * Validate strong password format
   *
   * @param password - The password string to validate
   * @returns True if valid strong password, false otherwise
   */
  isValidStrongPassword(password: string): boolean {
    return StringValidator.isStrongPassword(password);
  }

  /**
   * Validate JWT token format
   *
   * @param token - The JWT token string to validate
   * @returns True if valid JWT format, false otherwise
   */
  isValidJWTFormat(token: string): boolean {
    return StringValidator.isValidJWT(token);
  }

  /**
   * Sanitize string input by removing potentially harmful characters
   *
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  sanitizeString(input: string): string {
    return StringManipulator.sanitizeInput(input);
  }

  /**
   * Validate and sanitize display name
   *
   * @param displayName - The display name to validate and sanitize
   * @returns Sanitized display name or null if invalid
   */
  validateAndSanitizeDisplayName(displayName: string): string | null {
    if (!displayName) return null;

    const sanitized = this.sanitizeString(displayName);
    if (sanitized.length === 0 || sanitized.length > 100) {
      return null;
    }

    return sanitized;
  }

  /**
   * Check if a string contains only alphanumeric characters and allowed symbols
   *
   * @param input - The input string to check
   * @param allowedSymbols - Additional symbols to allow (default: underscore and hyphen)
   * @returns True if valid, false otherwise
   */
  isAlphanumericWithSymbols(
    input: string,
    allowedSymbols: string = '_-',
  ): boolean {
    if (!input) return false;

    const regex = new RegExp(
      `^[a-zA-Z0-9${allowedSymbols.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`,
    );
    return regex.test(input);
  }
}
