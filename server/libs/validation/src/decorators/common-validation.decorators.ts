import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsUUID,
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

/**
 * Common Validation Decorators
 *
 * This module provides reusable validation decorators that combine
 * class-validator decorators with Swagger documentation for consistent
 * validation patterns across all microservices.
 */

/**
 * Validates a UUID v4 field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for UUID validation and documentation
 */
export function IsUUIDField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'UUID v4 identifier',
      example: '123e4567-e89b-12d3-a456-426614174000',
      format: 'uuid',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    IsUUID('4'),
  );
}

/**
 * Validates an email field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for email validation and documentation
 */
export function IsEmailField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'Email address',
      example: 'user@example.com',
      format: 'email',
      ...options,
    }),
    IsEmail({}, { message: 'Please provide a valid email address' }),
    IsNotEmpty({ message: 'Email is required' }),
  );
}

/**
 * Validates a username field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for username validation and documentation
 */
export function IsUsernameField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description:
        'Username (3-50 characters, alphanumeric, underscore, hyphen)',
      example: 'john_doe',
      minLength: 3,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    MinLength(3, { message: 'Username must be at least 3 characters long' }),
    MaxLength(50, { message: 'Username cannot exceed 50 characters' }),
    Matches(/^[a-zA-Z0-9_-]+$/, {
      message:
        'Username can only contain letters, numbers, underscores, and hyphens',
    }),
  );
}

/**
 * Validates a strong password field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for password validation and documentation
 */
export function IsStrongPasswordField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description:
        'Strong password (min 8 chars, uppercase, lowercase, number)',
      example: 'Password123',
      minLength: 8,
      ...options,
    }),
    IsString({ message: 'Password must be a string' }),
    IsNotEmpty({ message: 'Password is required' }),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    Matches(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    }),
    Matches(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    }),
    Matches(/\d/, {
      message: 'Password must contain at least one number',
    }),
  );
}

/**
 * Validates a display name field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for display name validation and documentation
 */
export function IsDisplayNameField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'Display name (max 100 characters)',
      example: 'John Doe',
      maxLength: 100,
      ...options,
    }),
    IsString(),
    MaxLength(100, { message: 'Display name cannot exceed 100 characters' }),
  );
}

/**
 * Validates an optional string field with Swagger documentation
 *
 * @param maxLength - Maximum length for the string
 * @param options - Swagger API property options
 * @returns Combined decorator for optional string validation and documentation
 */
export function IsOptionalStringField(
  maxLength: number = 255,
  options?: ApiPropertyOptions,
) {
  return applyDecorators(
    ApiProperty({
      description: `Optional string field (max ${maxLength} characters)`,
      required: false,
      maxLength,
      ...options,
    }),
    IsString(),
    MaxLength(maxLength),
  );
}

/**
 * Custom validator for checking if a value is a valid JWT token
 *
 * @param validationOptions - Validation options
 * @returns Validation decorator
 */
export function IsJWTToken(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isJWTToken',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // Basic JWT format validation (3 parts separated by dots)
          const parts = value.split('.');
          if (parts.length !== 3) return false;

          // Check if each part is base64url encoded
          const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
          return parts.every((part) => base64UrlRegex.test(part));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid JWT token`;
        },
      },
    });
  };
}

/**
 * Validates a JWT token field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for JWT token validation and documentation
 */
export function IsJWTTokenField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'JWT token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    IsJWTToken(),
  );
}

/**
 * Validates a refresh token field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for refresh token validation and documentation
 */
export function IsRefreshTokenField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'Refresh token for obtaining new access tokens',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    IsJWTToken(),
  );
}
