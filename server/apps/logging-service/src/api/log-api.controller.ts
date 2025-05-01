import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { LogQueryService } from './log-query.service';
import { LogLevelService } from './log-level.service';
import { LogQueryDto, LogQueryResponseDto } from './dto/log-query.dto';
import { LogLevelUpdateDto, LogLevelResponseDto } from './dto/log-level.dto';
import { LogLevel } from '../kafka/log-message.interface';

/**
 * Controller for the Log Management API
 */
@Controller('api/logs')
export class LogApiController {
  private readonly logger = new Logger(LogApiController.name);

  constructor(
    private readonly logQueryService: LogQueryService,
    private readonly logLevelService: LogLevelService,
  ) {}

  /**
   * Query logs
   * @param queryDto The query parameters
   * @returns The query results
   */
  @Get()
  async queryLogs(
    @Query() queryDto: LogQueryDto,
  ): Promise<LogQueryResponseDto> {
    this.logger.debug(
      `Querying logs with parameters: ${JSON.stringify(queryDto)}`,
    );
    return this.logQueryService.queryLogs(queryDto);
  }

  /**
   * Update log level for a service
   * @param updateDto The update parameters
   * @returns The result of the update
   */
  @Post('level')
  async updateLogLevel(
    @Body() updateDto: LogLevelUpdateDto,
  ): Promise<LogLevelResponseDto> {
    this.logger.debug(`Updating log level: ${JSON.stringify(updateDto)}`);
    return this.logLevelService.updateLogLevel(updateDto);
  }

  /**
   * Get log level for a service
   * @param service The service name
   * @returns The log level
   */
  @Get('level')
  async getLogLevel(
    @Query('service') service: string,
  ): Promise<{ service: string; level: LogLevel }> {
    const level = this.logLevelService.getLogLevel(service);
    return { service, level };
  }

  /**
   * Get all service log levels
   * @returns A map of service names to log levels
   */
  @Get('levels')
  async getAllLogLevels(): Promise<Record<string, LogLevel>> {
    return this.logLevelService.getAllLogLevels();
  }
}
