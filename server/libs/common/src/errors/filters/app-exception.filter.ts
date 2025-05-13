import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { RequestIdUtil } from '@app/logging/utils/request-id.util';
import { AppError, ErrorCode } from '../app-error';
import { ErrorFactory } from '../error-factory';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
  requestId: string;
  correlationId?: string;
  details?: Record<string, any>;
  errors?: Record<string, string[]>;
}

/**
 * Global exception filter for handling all application errors
 *
 * This filter converts all exceptions to a standardized error response format
 * and logs errors with appropriate metadata.
 */
@Injectable()
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {}

  /**
   * Catch and handle exceptions
   * @param exception The exception
   * @param host The arguments host
   */
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Extract request ID
    const requestId = RequestIdUtil.extractRequestId(
      request.headers as Record<string, any>,
    );

    // Extract correlation ID (or use request ID as fallback)
    const correlationId = RequestIdUtil.extractCorrelationId(
      request.headers as Record<string, any>,
      requestId,
    );

    // Set request ID and correlation ID in logging service
    this.loggingService.setRequestId(requestId);
    this.loggingService.setCorrelationId(correlationId);

    // Convert to AppError
    const appError = this.convertToAppError(exception);

    // Get request information
    const method = request.method;
    const url = request.url;
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Log error with structured metadata using ErrorLoggerService
    this.errorLogger.error(appError, `Exception: ${method} ${url}`, {
      source: 'AppExceptionFilter',
      method: 'catch',
      requestId,
      correlationId,
      ip,
      userAgent,
      url,
      httpMethod: method,
      statusCode: appError.statusCode,
    });

    // Create error response
    const errorResponse: ErrorResponse = {
      statusCode: appError.statusCode,
      code: appError.code,
      message: appError.message,
      timestamp: new Date().toISOString(),
      path: url,
      requestId,
      correlationId,
      details: appError.metadata,
    };

    // Add validation errors if present
    if (
      appError.code === ErrorCode.VALIDATION_ERROR &&
      appError.metadata?.errors
    ) {
      errorResponse.errors = appError.metadata.errors;
    }

    // Send response
    response
      .code(appError.statusCode)
      .header('X-Request-ID', requestId)
      .header('X-Correlation-ID', correlationId)
      .send(errorResponse);
  }

  /**
   * Convert any error to an AppError
   * @param exception The exception
   * @returns An AppError
   */
  private convertToAppError(exception: Error): AppError {
    if (exception instanceof AppError) {
      return exception;
    }

    return ErrorFactory.fromError(exception);
  }

  /**
   * Get client IP address
   * @param request The request
   * @returns The client IP address
   */
  private getClientIp(request: FastifyRequest): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.ip ||
      'unknown'
    );
  }
}
