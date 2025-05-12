import { ValidationError as ClassValidatorError } from 'class-validator';
import { HttpException } from '@nestjs/common';
import { DomainError, ErrorCode } from '../index';

/**
 * Field validation error
 */
export interface FieldValidationError {
  /**
   * Field name
   */
  field: string;

  /**
   * Error messages
   */
  messages: string[];

  /**
   * Validation constraints
   */
  constraints?: Record<string, string>;

  /**
   * Nested validation errors
   */
  children?: FieldValidationError[];
}

/**
 * Enhanced validation error
 *
 * Provides detailed information about validation errors, including
 * field-level errors and constraints.
 */
export class EnhancedValidationError extends DomainError {
  /**
   * Field-level validation errors
   */
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {},
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      400,
      { ...metadata, errors: fieldErrors },
      cause,
    );

    this.fieldErrors = fieldErrors;
  }

  /**
   * Create a validation error from class-validator errors
   * @param errors Class validator errors
   * @param message Optional custom message
   * @returns Enhanced validation error
   */
  static fromClassValidator(
    errors: ClassValidatorError[],
    message = 'Validation failed',
  ): EnhancedValidationError {
    const fieldErrors: Record<string, string[]> = {};

    for (const error of errors) {
      const field = error.property;
      const messages: string[] = [];

      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.extractNestedErrors(error.children, field);
        Object.assign(fieldErrors, nestedErrors);
      }

      if (messages.length > 0) {
        fieldErrors[field] = messages;
      }
    }

    return new EnhancedValidationError(message, fieldErrors);
  }

  /**
   * Create a validation error from a NestJS validation error
   * @param error NestJS HttpException containing validation errors
   * @returns Enhanced validation error
   */
  static fromNestValidationError(
    error: HttpException,
  ): EnhancedValidationError {
    const response = error.getResponse() as any;
    const message = response.message || 'Validation failed';
    const fieldErrors: Record<string, string[]> = {};

    if (Array.isArray(response.message)) {
      // Handle array of error messages
      for (const msg of response.message) {
        const match = msg.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const field = match[1];
          const errorMsg = match[2];

          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }

          fieldErrors[field].push(errorMsg);
        }
      }
    }

    return new EnhancedValidationError(message, fieldErrors);
  }

  /**
   * Extract nested validation errors
   * @param errors Nested validation errors
   * @param parentField Parent field name
   * @returns Record of field errors
   */
  private static extractNestedErrors(
    errors: ClassValidatorError[],
    parentField: string,
  ): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};

    for (const error of errors) {
      const field = `${parentField}.${error.property}`;
      const messages: string[] = [];

      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.extractNestedErrors(error.children, field);
        Object.assign(fieldErrors, nestedErrors);
      }

      if (messages.length > 0) {
        fieldErrors[field] = messages;
      }
    }

    return fieldErrors;
  }
}
