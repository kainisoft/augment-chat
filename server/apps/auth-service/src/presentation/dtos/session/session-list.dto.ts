import { ApiProperty } from '@nestjs/swagger';
import { SessionInfoDto } from './session-info.dto';
import { ListResponseDto } from '@app/dtos';

/**
 * Session List DTO
 *
 * Contains a list of user sessions.
 * Extends the shared list response DTO for consistent pagination behavior.
 */
export class SessionListDto extends ListResponseDto<SessionInfoDto> {
  @ApiProperty({
    description: 'List of active sessions',
    type: [SessionInfoDto],
  })
  declare items: SessionInfoDto[];
}
