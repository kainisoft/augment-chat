import { ApiProperty } from '@nestjs/swagger';
import { SessionInfoDto } from './session-info.dto';

/**
 * Session List DTO
 *
 * Contains a list of user sessions
 */
export class SessionListDto {
  @ApiProperty({
    description: 'List of active sessions',
    type: [SessionInfoDto],
  })
  sessions: SessionInfoDto[];

  @ApiProperty({
    description: 'Total number of active sessions',
    example: 3,
  })
  totalCount: number;
}
