import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';
import { SessionListDto } from './dto/session-list.dto';
import { TerminateSessionResponseDto } from './dto/terminate-session.dto';
import { SessionHistoryDto } from './dto/session-history.dto';
import { GetUserSessionsCommand } from '../application/commands/impl/get-user-sessions.command';
import { TerminateSessionCommand } from '../application/commands/impl/terminate-session.command';
import { TerminateAllSessionsCommand } from '../application/commands/impl/terminate-all-sessions.command';
import { GetSessionHistoryQuery } from '../application/queries/impl/get-session-history.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Session Controller
 *
 * Handles session management endpoints
 */
@ApiTags('sessions')
@Controller('auth/sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
  ) {
    // Set context for all logs from this controller
    this.loggingService.setContext(SessionController.name);
  }

  /**
   * Get all active sessions for the current user
   * @param req Request object
   * @returns List of active sessions
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all active sessions for the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active sessions',
    type: SessionListDto,
  })
  async getSessions(@Req() req: any): Promise<SessionListDto> {
    const userId = req.user.sub;
    const currentSessionId = req.user.sessionId;

    this.loggingService.debug('Getting sessions for user', 'getSessions', {
      userId,
    });

    return this.commandBus.execute(
      new GetUserSessionsCommand(userId, currentSessionId),
    );
  }

  /**
   * Terminate a specific session
   * @param req Request object
   * @param sessionId Session ID to terminate
   * @returns Success response
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate a specific session' })
  @ApiParam({
    name: 'id',
    description: 'Session ID to terminate',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session terminated successfully',
    type: TerminateSessionResponseDto,
  })
  async terminateSession(
    @Req() req: any,
    @Param('id') sessionId: string,
  ): Promise<TerminateSessionResponseDto> {
    const userId = req.user.sub;
    const currentSessionId = req.user.sessionId;

    this.loggingService.debug('Terminating session', 'terminateSession', {
      userId,
      sessionId,
    });

    return this.commandBus.execute(
      new TerminateSessionCommand(userId, sessionId, currentSessionId),
    );
  }

  /**
   * Terminate all sessions except the current one
   * @param req Request object
   * @returns Success response
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate all sessions except the current one' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All sessions terminated successfully',
    type: TerminateSessionResponseDto,
  })
  async terminateAllSessions(
    @Req() req: any,
  ): Promise<TerminateSessionResponseDto> {
    const userId = req.user.sub;
    const currentSessionId = req.user.sessionId;

    this.loggingService.debug(
      'Terminating all sessions except current',
      'terminateAllSessions',
      { userId },
    );

    return this.commandBus.execute(
      new TerminateAllSessionsCommand(userId, currentSessionId),
    );
  }

  /**
   * Get session history for the current user
   * @param req Request object
   * @param limit Maximum number of entries to return
   * @param offset Number of entries to skip
   * @returns Session history
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get session history for the current user' })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of entries to return',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of entries to skip',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session history',
    type: SessionHistoryDto,
  })
  async getSessionHistory(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SessionHistoryDto> {
    const userId = req.user.sub;

    this.loggingService.debug('Getting session history', 'getSessionHistory', {
      userId,
      limit,
      offset,
    });

    return this.queryBus.execute(
      new GetSessionHistoryQuery(userId, limit, offset),
    );
  }
}
