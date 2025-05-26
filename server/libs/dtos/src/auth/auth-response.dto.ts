import { ApiProperty } from '@nestjs/swagger';

/**
 * Authentication Response DTO
 *
 * Data Transfer Object for authentication responses.
 * Used across all services that return authentication tokens.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token for API authorization',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'sess_123456789',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;
}

/**
 * Token Validation Response DTO
 *
 * Data Transfer Object for token validation responses.
 * Used across all services that validate authentication tokens.
 */
export class TokenValidationResponseDto {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
  })
  valid: boolean;

  @ApiProperty({
    description: 'User ID if token is valid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'User email if token is valid',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Session ID if token is valid',
    example: 'sess_123456789',
    required: false,
  })
  sessionId?: string;

  @ApiProperty({
    description: 'Whether the user is verified',
    example: true,
    required: false,
  })
  isVerified?: boolean;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
    required: false,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Error message if token is invalid',
    example: 'Token has expired',
    required: false,
  })
  error?: string;
}

/**
 * Logout Response DTO
 *
 * Data Transfer Object for logout responses.
 * Used across all services that handle user logout.
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Successfully logged out',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the logout was successful',
    example: true,
  })
  success: boolean;
}
