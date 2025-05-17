import { ApiProperty } from '@nestjs/swagger';

/**
 * Session Info DTO
 *
 * Contains information about a user session
 */
export class SessionInfoDto {
  @ApiProperty({
    description: 'Session ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'IP address used for login',
    example: '192.168.1.1',
  })
  ip?: string;

  @ApiProperty({
    description: 'User agent used for login',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Session creation timestamp',
    example: 1617123456789,
  })
  createdAt: number;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: 1617123456789,
  })
  lastAccessedAt: number;

  @ApiProperty({
    description: 'Session expiration timestamp',
    example: 1617123456789,
  })
  expiresAt: number;

  @ApiProperty({
    description: 'Whether this is the current session',
    example: true,
  })
  isCurrentSession: boolean;

  @ApiProperty({
    description: 'Device information',
    example: {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop',
    },
    required: false,
  })
  deviceInfo?: Record<string, any>;

  @ApiProperty({
    description: 'Geographic location',
    example: {
      country: 'United States',
      city: 'New York',
    },
    required: false,
  })
  location?: Record<string, any>;
}
