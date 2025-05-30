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
  IsUrl,
  IsISO8601,
  IsOptional,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';

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
    ApiPropertyOptional({
      description: `Optional string field (max ${maxLength} characters)`,
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
 * Validates a bio field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for bio validation and documentation
 */
export function IsBioField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'User biography (max 500 characters)',
      example:
        'Software developer passionate about creating amazing user experiences.',
      maxLength: 500,
      ...options,
    }),
    IsOptional(),
    IsString(),
    MaxLength(500, { message: 'Bio cannot exceed 500 characters' }),
  );
}

/**
 * Validates an avatar URL field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for avatar URL validation and documentation
 */
export function IsAvatarUrlField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'Avatar URL (max 255 characters)',
      example: 'https://example.com/avatar.jpg',
      maxLength: 255,
      format: 'uri',
      ...options,
    }),
    IsOptional(),
    IsString(),
    MaxLength(255, { message: 'Avatar URL cannot exceed 255 characters' }),
    IsUrl({}, { message: 'Avatar URL must be a valid URL' }),
  );
}

/**
 * Validates a search term field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for search term validation and documentation
 */
export function IsSearchTermField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'Search term (1-100 characters)',
      example: 'john doe',
      minLength: 1,
      maxLength: 100,
      ...options,
    }),
    IsString(),
    IsNotEmpty({ message: 'Search term cannot be empty' }),
    MinLength(1, { message: 'Search term must be at least 1 character long' }),
    MaxLength(100, { message: 'Search term cannot exceed 100 characters' }),
  );
}

/**
 * Validates an ISO 8601 date field with Swagger documentation
 *
 * @param options - Swagger API property options
 * @returns Combined decorator for ISO date validation and documentation
 */
export function IsISODateField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'ISO 8601 date string',
      example: '2023-07-19T00:00:00.000Z',
      format: 'date-time',
      ...options,
    }),
    IsOptional(),
    IsISO8601({}, { message: 'Date must be a valid ISO 8601 date string' }),
  );
}

/**
 * Validates a date range with from and to dates
 *
 * @param fromField - Name of the from date field
 * @param toField - Name of the to date field
 * @param validationOptions - Validation options
 * @returns Validation decorator
 */
export function IsValidDateRange(
  fromField: string,
  toField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const fromDate = obj[fromField];
          const toDate = obj[toField];

          if (!fromDate || !toDate) {
            return true; // Let individual field validation handle required checks
          }

          const from = new Date(fromDate);
          const to = new Date(toDate);

          return from <= to;
        },
        defaultMessage(args: ValidationArguments) {
          return `${toField} must be after ${fromField}`;
        },
      },
    });
  };
}

/**
 * Validates a log level enum field with Swagger documentation
 *
 * @param logLevelEnum - The log level enum object
 * @param options - Swagger API property options
 * @returns Combined decorator for log level validation and documentation
 */
export function IsLogLevelField(
  logLevelEnum: any,
  options?: ApiPropertyOptions,
) {
  return applyDecorators(
    ApiPropertyOptional({
      description: 'Log level filter',
      example: 'info',
      enum: logLevelEnum,
      ...options,
    }),
    IsOptional(),
    IsString(),
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
