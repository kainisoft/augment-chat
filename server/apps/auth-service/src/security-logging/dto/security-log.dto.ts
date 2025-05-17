import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SecurityEventType,
  SecurityEventSeverity,
} from '../interfaces/security-event.interface';

/**
 * Security Log Response DTO
 */
export class SecurityLogResponseDto {
  @ApiProperty({
    enum: SecurityEventType,
    description: 'Type of security event',
  })
  @IsEnum(SecurityEventType)
  type: SecurityEventType;

  @ApiProperty({
    enum: SecurityEventSeverity,
    description: 'Severity level of the security event',
  })
  @IsEnum(SecurityEventSeverity)
  severity: SecurityEventSeverity;

  @ApiProperty({
    description: 'Timestamp of the event in milliseconds since epoch',
    example: 1625097600000,
  })
  @IsNumber()
  timestamp: number;

  @ApiProperty({
    description: 'Event data containing details about the security event',
    type: 'object',
  })
  @IsObject()
  data: {
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    success?: boolean;
    reason?: string;
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Formatted date string for display purposes',
    example: '2023-06-30T12:00:00.000Z',
  })
  @IsString()
  formattedDate: string;
}

/**
 * Security Log Query DTO
 */
export class SecurityLogQueryDto {
  @ApiProperty({
    description: 'Maximum number of logs to return',
    default: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 50;

  @ApiProperty({
    description: 'Offset for pagination',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 0;

  @ApiProperty({
    description: 'Event types to filter by',
    enum: SecurityEventType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsEnum(SecurityEventType, { each: true })
  @IsArray()
  eventTypes?: SecurityEventType[];

  @ApiProperty({
    description: 'Start time for filtering (timestamp in ms)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startTime?: number;

  @ApiProperty({
    description: 'End time for filtering (timestamp in ms)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endTime?: number;
}

/**
 * Security Log Stats Response DTO
 */
export class SecurityLogStatsDto {
  @ApiProperty({
    description: 'Total number of security events',
    example: 120,
  })
  @IsNumber()
  totalEvents: number;

  @ApiProperty({
    description: 'Number of events by type',
    example: {
      login_attempt: 50,
      login_success: 40,
      login_failure: 10,
    },
  })
  @IsObject()
  eventCounts: Record<SecurityEventType, number>;

  @ApiProperty({
    description: 'Number of events by severity',
    example: {
      info: 80,
      warning: 30,
      error: 10,
      critical: 0,
    },
  })
  @IsObject()
  severityCounts: Record<SecurityEventSeverity, number>;

  @ApiProperty({
    description: 'Recent login success rate (percentage)',
    example: 80,
  })
  @IsNumber()
  loginSuccessRate: number;

  @ApiProperty({
    description: 'Recent failed login attempts',
    example: 5,
  })
  @IsNumber()
  recentFailedLogins: number;

  @ApiProperty({
    description: 'Recent account lockouts',
    example: 1,
  })
  @IsNumber()
  recentAccountLockouts: number;
}

/**
 * Security Dashboard Response DTO
 */
export class SecurityDashboardDto {
  @ApiProperty({
    description: 'Security statistics',
    type: SecurityLogStatsDto,
  })
  @IsObject()
  stats: SecurityLogStatsDto;

  @ApiProperty({
    description: 'Recent security events',
    type: [SecurityLogResponseDto],
  })
  @IsArray()
  recentEvents: SecurityLogResponseDto[];

  @ApiProperty({
    description: 'Recent failed login attempts',
    type: [SecurityLogResponseDto],
  })
  @IsArray()
  recentFailedLogins: SecurityLogResponseDto[];

  @ApiProperty({
    description: 'Recent suspicious activities',
    type: [SecurityLogResponseDto],
  })
  @IsArray()
  recentSuspiciousActivities: SecurityLogResponseDto[];
}
