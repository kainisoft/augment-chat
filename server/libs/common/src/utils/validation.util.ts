/**
 * Validation Utilities
 *
 * Centralized validation utilities to eliminate duplicate validation
 * logic across shared modules and provide consistent validation patterns.
 */

import { StringValidator, REGEX_PATTERNS } from './string.util';
import { DateValidator } from './date.util';

/**
 * Common validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validation options interface
 */
export interface ValidationOptions {
  required?: boolean;
  allowEmpty?: boolean;
  customMessage?: string;
  context?: string;
}

/**
 * Core validation utilities
 */
export class CoreValidator {
  /**
   * Validate required field
   * @param value - Value to validate
   * @param fieldName - Field name for error messages
   * @returns Validation result
   */
  static validateRequired(value: any, fieldName: string): ValidationResult {
    const isValid = value !== null && value !== undefined && value !== '';

    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} is required`],
    };
  }

  /**
   * Validate string length
   * @param value - String value to validate
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @param fieldName - Field name for error messages
   * @returns Validation result
   */
  static validateStringLength(
    value: string,
    minLength: number,
    maxLength: number,
    fieldName: string,
  ): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
      return { isValid: false, errors };
    }

    if (value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }

    if (value.length > maxLength) {
      errors.push(
        `${fieldName} must be no more than ${maxLength} characters long`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate numeric range
   * @param value - Numeric value to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @param fieldName - Field name for error messages
   * @returns Validation result
   */
  static validateNumericRange(
    value: number,
    min: number,
    max: number,
    fieldName: string,
  ): ValidationResult {
    const errors: string[] = [];

    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${fieldName} must be a valid number`);
      return { isValid: false, errors };
    }

    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }

    if (value > max) {
      errors.push(`${fieldName} must be no more than ${max}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate array length
   * @param value - Array value to validate
   * @param minLength - Minimum array length
   * @param maxLength - Maximum array length
   * @param fieldName - Field name for error messages
   * @returns Validation result
   */
  static validateArrayLength(
    value: any[],
    minLength: number,
    maxLength: number,
    fieldName: string,
  ): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
      return { isValid: false, errors };
    }

    if (value.length < minLength) {
      errors.push(`${fieldName} must contain at least ${minLength} items`);
    }

    if (value.length > maxLength) {
      errors.push(`${fieldName} must contain no more than ${maxLength} items`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Business logic validators
 */
export class BusinessValidator {
  /**
   * Validate email with business rules
   * @param email - Email to validate
   * @param options - Validation options
   * @returns Validation result
   */
  static validateEmail(
    email: string,
    options: ValidationOptions = {},
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required check
    if (options.required && !email) {
      errors.push(options.customMessage || 'Email is required');
      return { isValid: false, errors, warnings };
    }

    // Allow empty if not required
    if (!options.required && !email) {
      return { isValid: true, errors: [], warnings };
    }

    // Format validation
    if (!StringValidator.isValidEmail(email)) {
      errors.push(
        options.customMessage || 'Please provide a valid email address',
      );
      return { isValid: false, errors, warnings };
    }

    // Business rules
    const domain = email.split('@')[1];

    // Check for common typos in popular domains
    const commonDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
    ];
    const typoPatterns = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
    };

    if (typoPatterns[domain]) {
      warnings.push(
        `Did you mean ${email.replace(domain, typoPatterns[domain])}?`,
      );
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push('Email contains invalid dot patterns');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate password with strength requirements
   * @param password - Password to validate
   * @param options - Validation options
   * @returns Validation result
   */
  static validatePassword(
    password: string,
    options: ValidationOptions = {},
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required check
    if (options.required && !password) {
      errors.push(options.customMessage || 'Password is required');
      return { isValid: false, errors, warnings };
    }

    // Allow empty if not required
    if (!options.required && !password) {
      return { isValid: true, errors: [], warnings };
    }

    // Length validation
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long');
    }

    // Strength validation
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[@$!%*?&]/.test(password);

    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }

    if (!hasSpecialChars) {
      errors.push(
        'Password must contain at least one special character (@$!%*?&)',
      );
    }

    // Common password checks
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }

    // Sequential characters check
    if (/123456|abcdef|qwerty/i.test(password)) {
      warnings.push(
        'Password contains sequential characters which may be less secure',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate username with business rules
   * @param username - Username to validate
   * @param options - Validation options
   * @returns Validation result
   */
  static validateUsername(
    username: string,
    options: ValidationOptions = {},
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required check
    if (options.required && !username) {
      errors.push(options.customMessage || 'Username is required');
      return { isValid: false, errors, warnings };
    }

    // Allow empty if not required
    if (!options.required && !username) {
      return { isValid: true, errors: [], warnings };
    }

    // Length validation
    const lengthResult = CoreValidator.validateStringLength(
      username,
      3,
      30,
      'Username',
    );
    if (!lengthResult.isValid) {
      errors.push(...lengthResult.errors);
    }

    // Format validation
    if (!StringValidator.isValidUsername(username)) {
      errors.push(
        'Username can only contain letters, numbers, underscores, and hyphens',
      );
    }

    // Business rules
    if (username.startsWith('_') || username.startsWith('-')) {
      errors.push('Username cannot start with underscore or hyphen');
    }

    if (username.endsWith('_') || username.endsWith('-')) {
      errors.push('Username cannot end with underscore or hyphen');
    }

    // Reserved usernames
    const reservedUsernames = [
      'admin',
      'administrator',
      'root',
      'system',
      'api',
      'www',
      'mail',
      'email',
      'support',
      'help',
      'info',
      'contact',
      'user',
      'guest',
      'anonymous',
      'null',
      'undefined',
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      errors.push('Username is reserved and cannot be used');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate date range
   * @param fromDate - Start date
   * @param toDate - End date
   * @param fieldName - Field name for error messages
   * @returns Validation result
   */
  static validateDateRange(
    fromDate: string,
    toDate: string,
    fieldName: string = 'Date range',
  ): ValidationResult {
    const errors: string[] = [];

    // Validate individual dates
    if (!DateValidator.isValidISODate(fromDate)) {
      errors.push(`${fieldName} start date must be a valid ISO date`);
    }

    if (!DateValidator.isValidISODate(toDate)) {
      errors.push(`${fieldName} end date must be a valid ISO date`);
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Validate range
    if (!DateValidator.isValidDateRange(fromDate, toDate)) {
      errors.push(
        `${fieldName} start date must be before or equal to end date`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Composite validator for complex validation scenarios
 */
export class CompositeValidator {
  /**
   * Validate multiple fields and return combined result
   * @param validations - Array of validation functions
   * @returns Combined validation result
   */
  static validateAll(
    validations: (() => ValidationResult)[],
  ): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let isValid = true;

    for (const validation of validations) {
      const result = validation();

      if (!result.isValid) {
        isValid = false;
      }

      allErrors.push(...result.errors);

      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    }

    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    };
  }

  /**
   * Validate at least one of multiple conditions
   * @param validations - Array of validation functions
   * @param errorMessage - Error message if all validations fail
   * @returns Validation result
   */
  static validateAny(
    validations: (() => ValidationResult)[],
    errorMessage: string,
  ): ValidationResult {
    for (const validation of validations) {
      const result = validation();
      if (result.isValid) {
        return { isValid: true, errors: [] };
      }
    }

    return {
      isValid: false,
      errors: [errorMessage],
    };
  }

  /**
   * Conditional validation - only validate if condition is met
   * @param condition - Condition function
   * @param validation - Validation function to run if condition is true
   * @returns Validation result
   */
  static validateIf(
    condition: () => boolean,
    validation: () => ValidationResult,
  ): ValidationResult {
    if (!condition()) {
      return { isValid: true, errors: [] };
    }

    return validation();
  }
}

/**
 * Export all validation utilities for easy access
 */
export const ValidationUtils = {
  Core: CoreValidator,
  Business: BusinessValidator,
  Composite: CompositeValidator,
  Patterns: REGEX_PATTERNS,
} as const;
