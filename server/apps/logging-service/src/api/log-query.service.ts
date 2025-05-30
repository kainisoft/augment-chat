import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogQueryDto, LogQueryResponseDto } from './dto/log-query.dto';
import { LogLevel } from '../kafka/log-message.interface';

/**
 * Service for querying logs from Loki
 */
@Injectable()
export class LogQueryService {
  private readonly logger = new Logger(LogQueryService.name);
  private readonly defaultLokiUrl: string;
  private readonly defaultLimit = 100;
  private readonly maxLimit = 1000;

  constructor(private readonly configService: ConfigService) {
    this.defaultLokiUrl = this.configService.get<string>(
      'LOKI_URL',
      'http://loki:3100',
    );
  }

  /**
   * Query logs from Loki
   * @param queryDto The query parameters
   * @returns The query results
   */
  async queryLogs(queryDto: LogQueryDto): Promise<LogQueryResponseDto> {
    try {
      // Build Loki query
      const lokiQuery = this.buildLokiQuery(queryDto);

      // Set query time range
      const { start, end } = this.getTimeRange(queryDto);

      // Set limit and direction
      const limit = Math.min(
        queryDto.limit || this.defaultLimit,
        this.maxLimit,
      );
      const direction = 'backward'; // Most recent logs first

      // Build the query URL
      const queryUrl = new URL('/loki/api/v1/query_range', this.defaultLokiUrl);
      queryUrl.searchParams.append('query', lokiQuery);
      queryUrl.searchParams.append('start', start);
      queryUrl.searchParams.append('end', end);
      queryUrl.searchParams.append('limit', limit.toString());
      queryUrl.searchParams.append('direction', direction);

      // Execute the query
      const response = await fetch(queryUrl.toString());

      if (!response.ok) {
        throw new Error(`Loki query failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse the results
      const logs = this.parseLokiResponse(data);

      return LogQueryResponseDto.createLogResponse(
        logs,
        logs.length, // Loki doesn't provide a total count, so we use the returned count
        limit,
        (queryDto as any).offset || 0,
        queryDto.query,
        0, // searchTime
      );
    } catch (error: any) {
      this.logger.error(`Error querying logs: ${error.message}`, error.stack);

      // Return empty results on error
      return LogQueryResponseDto.createLogResponse(
        [],
        0,
        queryDto.limit || this.defaultLimit,
        (queryDto as any).offset || 0,
        queryDto.query,
        0, // searchTime
      );
    }
  }

  /**
   * Build a Loki query string from the query parameters
   * @param queryDto The query parameters
   * @returns The Loki query string
   */
  private buildLokiQuery(queryDto: LogQueryDto): string {
    // Start with a base query that selects all logs
    let query = '{';

    // Add label selectors
    const labelSelectors: string[] = [];

    // Filter by service
    if (queryDto.service) {
      labelSelectors.push(`service="${queryDto.service}"`);
    }

    // Filter by log level
    if (queryDto.level) {
      labelSelectors.push(`level="${queryDto.level}"`);
    }

    // Add all label selectors to the query
    query += labelSelectors.join(', ');
    query += '}';

    // Add text search if provided
    if (queryDto.query) {
      query += ` |= \`${queryDto.query}\``;
    }

    return query;
  }

  /**
   * Get the time range for the query
   * @param queryDto The query parameters
   * @returns The start and end times in RFC3339Nano format
   */
  private getTimeRange(queryDto: LogQueryDto): { start: string; end: string } {
    const now = new Date();
    let start: Date;
    let end: Date;

    // Parse the 'from' parameter or default to 1 hour ago
    if (queryDto.from) {
      start = new Date(queryDto.from);
    } else {
      start = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    }

    // Parse the 'to' parameter or default to now
    if (queryDto.to) {
      end = new Date(queryDto.to);
    } else {
      end = now;
    }

    // Format dates for Loki (RFC3339Nano)
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }

  /**
   * Parse the Loki response into a list of log messages
   * @param response The Loki response
   * @returns An array of log messages
   */
  private parseLokiResponse(response: any): Record<string, any>[] {
    const logs: Record<string, any>[] = [];

    // Check if the response has the expected structure
    if (response?.data?.result && Array.isArray(response.data.result)) {
      // Process each stream in the result
      for (const stream of response.data.result) {
        const labels = stream.stream || {};

        // Process each log entry in the stream
        if (Array.isArray(stream.values)) {
          for (const [timestamp, value] of stream.values) {
            try {
              // Parse the log message JSON
              const logMessage = JSON.parse(value) as Record<string, any>;

              // Add the log to the results
              logs.push(logMessage);
            } catch (error) {
              // If the log message isn't valid JSON, create a simple log object
              logs.push({
                timestamp: new Date(
                  parseInt(timestamp) / 1000000,
                ).toISOString(),
                message: value,
                level: labels.level || LogLevel.INFO,
                service: labels.service || 'unknown',
              });
            }
          }
        }
      }
    }

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return logs;
  }
}
