import { IsOptional } from 'class-validator';
import {
  IsEmailField,
  IsStrongPasswordField,
  IsJWTTokenField,
  IsRefreshTokenField,
} from '@app/validation';

/**
 * Login Request DTO
 *
 * Data Transfer Object for user login requests.
 * Used across all services that need to authenticate users.
 */
export class LoginDto {
  @IsEmailField({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsStrongPasswordField({
    description: 'User password',
    example: 'Password123',
  })
  password: string;
}

/**
 * Register Request DTO
 *
 * Data Transfer Object for user registration requests.
 * Used across all services that need to register users.
 */
export class RegisterDto {
  @IsEmailField({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @IsStrongPasswordField({
    description: 'User password (min 8 chars, uppercase, lowercase, number)',
    example: 'Password123',
  })
  password: string;
}

/**
 * Refresh Token Request DTO
 *
 * Data Transfer Object for refresh token requests.
 * Used across all services that need to refresh authentication tokens.
 */
export class RefreshTokenDto {
  @IsRefreshTokenField({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

/**
 * Forgot Password Request DTO
 *
 * Data Transfer Object for initiating password reset.
 * Used across all services that need to handle password reset requests.
 */
export class ForgotPasswordDto {
  @IsEmailField({
    description: 'User email address for password reset',
    example: 'user@example.com',
  })
  email: string;
}

/**
 * Reset Password Request DTO
 *
 * Data Transfer Object for completing password reset.
 * Used across all services that need to handle password reset completion.
 */
export class ResetPasswordDto {
  @IsJWTTokenField({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @IsStrongPasswordField({
    description: 'New password (min 8 chars, uppercase, lowercase, number)',
    example: 'NewPassword123',
  })
  password: string;
}

/**
 * Validate Token Request DTO
 *
 * Data Transfer Object for token validation requests.
 * Used across all services that need to validate authentication tokens.
 */
export class ValidateTokenDto {
  @IsJWTTokenField({
    description: 'Token to validate',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @IsOptional()
  tokenType?: 'access' | 'refresh';
}
