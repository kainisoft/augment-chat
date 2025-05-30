import { ApiProperty } from '@nestjs/swagger';

/**
 * Terminate Session Response DTO
 *
 * Response for session termination endpoints
 */
export class TerminateSessionResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Number of sessions terminated',
    example: 1,
  })
  terminatedCount: number;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Session terminated successfully',
  })
  message: string;
}
