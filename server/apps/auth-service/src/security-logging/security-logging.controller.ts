import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LoggingService } from '@app/logging';
import { JwtAuthGuard } from '@app/iam';
import { SecurityLoggingService } from './security-logging.service';
import { SecurityLoggingRepository } from './security-logging.repository';
import {
  SecurityLogResponseDto,
  SecurityLogQueryDto,
  SecurityLogStatsDto,
  SecurityDashboardDto,
} from './dto/security-log.dto';
import {
  SecurityEventType,
  SecurityEventSeverity,
} from './interfaces/security-event.interface';

@ApiTags('security')
@Controller('auth/security')
@UseGuards(JwtAuthGuard)
export class SecurityLoggingController {
  constructor(
    private readonly securityLoggingService: SecurityLoggingService,
    private readonly securityLoggingRepository: SecurityLoggingRepository,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(SecurityLoggingController.name);
  }

  /**
   * Get security logs for the current user
   * @param req Request object
   * @param query Query parameters
   * @returns Security logs for the current user
   */
  @Get('logs')
  @ApiOperation({ summary: 'Get security logs for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Security logs retrieved successfully',
    type: [SecurityLogResponseDto],
  })
  async getUserLogs(
    @Req() req: any,
    @Query() query: SecurityLogQueryDto,
  ): Promise<SecurityLogResponseDto[]> {
    const userId = req.user.sub;

    this.loggingService.debug(
      `Retrieving security logs for user ${userId}`,
      'getUserLogs',
      { userId, query },
    );

    const logs = await this.securityLoggingRepository.getUserLogs(
      userId,
      query.limit,
      query.offset,
      query.eventTypes,
      query.startTime,
      query.endTime,
    );

    // Transform logs to DTOs
    return logs.map((log) => ({
      ...log,
      formattedDate: new Date(log.timestamp).toISOString(),
    }));
  }

  /**
   * Get security log statistics for the current user
   * @param req Request object
   * @returns Security log statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get security log statistics for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Security log statistics retrieved successfully',
    type: SecurityLogStatsDto,
  })
  async getUserStats(@Req() req: any): Promise<SecurityLogStatsDto> {
    const userId = req.user.sub;

    this.loggingService.debug(
      `Retrieving security stats for user ${userId}`,
      'getUserStats',
      { userId },
    );

    // Get event counts
    const eventCounts =
      await this.securityLoggingRepository.getEventCounts(userId);

    // Calculate total events
    const totalEvents = Object.values(eventCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    // Calculate severity counts
    const severityCounts: Record<SecurityEventSeverity, number> = {
      [SecurityEventSeverity.INFO]: 0,
      [SecurityEventSeverity.WARNING]: 0,
      [SecurityEventSeverity.ERROR]: 0,
      [SecurityEventSeverity.CRITICAL]: 0,
    };

    // Get recent logs to calculate severity counts
    const recentLogs = await this.securityLoggingRepository.getUserLogs(
      userId,
      100,
    );
    recentLogs.forEach((log) => {
      severityCounts[log.severity]++;
    });

    // Calculate login success rate
    const loginAttempts = eventCounts[SecurityEventType.LOGIN_ATTEMPT] || 0;
    const loginSuccesses = eventCounts[SecurityEventType.LOGIN_SUCCESS] || 0;
    const loginSuccessRate =
      loginAttempts > 0
        ? Math.round((loginSuccesses / loginAttempts) * 100)
        : 100;

    // Get recent failed logins and account lockouts
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentFailedLogins = await this.securityLoggingRepository.getUserLogs(
      userId,
      100,
      0,
      [SecurityEventType.LOGIN_FAILURE],
      oneWeekAgo,
    );

    const recentAccountLockouts =
      await this.securityLoggingRepository.getUserLogs(
        userId,
        100,
        0,
        [SecurityEventType.ACCOUNT_LOCKED],
        oneWeekAgo,
      );

    return {
      totalEvents,
      eventCounts,
      severityCounts,
      loginSuccessRate,
      recentFailedLogins: recentFailedLogins.length,
      recentAccountLockouts: recentAccountLockouts.length,
    };
  }

  /**
   * Get security dashboard data for the current user
   * @param req Request object
   * @returns Security dashboard data
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get security dashboard data for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Security dashboard data retrieved successfully',
    type: SecurityDashboardDto,
  })
  async getDashboard(@Req() req: any): Promise<SecurityDashboardDto> {
    const userId = req.user.sub;

    this.loggingService.debug(
      `Retrieving security dashboard for user ${userId}`,
      'getDashboard',
      { userId },
    );

    // Get stats
    const stats = await this.getUserStats(req);

    // Get recent events
    const recentEvents = await this.securityLoggingRepository.getUserLogs(
      userId,
      10,
    );

    // Get recent failed logins
    const recentFailedLogins = await this.securityLoggingRepository.getUserLogs(
      userId,
      5,
      0,
      [SecurityEventType.LOGIN_FAILURE],
    );

    // Get recent suspicious activities
    const suspiciousEventTypes = [
      SecurityEventType.ACCOUNT_LOCKED,
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.PERMISSION_VIOLATION,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
    ];

    const recentSuspiciousActivities =
      await this.securityLoggingRepository.getUserLogs(
        userId,
        5,
        0,
        suspiciousEventTypes,
      );

    // Transform logs to DTOs
    const transformLogs = (logs: any[]) =>
      logs.map((log) => ({
        ...log,
        formattedDate: new Date(log.timestamp).toISOString(),
      }));

    return {
      stats,
      recentEvents: transformLogs(recentEvents),
      recentFailedLogins: transformLogs(recentFailedLogins),
      recentSuspiciousActivities: transformLogs(recentSuspiciousActivities),
    };
  }
}
