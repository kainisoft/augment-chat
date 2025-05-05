import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggingService } from '../logging.service';
import { RequestIdUtil } from '../utils/request-id.util';
import {
  HttpLogMetadata,
  ErrorLogMetadata,
} from '../interfaces/log-message.interface';

/**
 * Interceptor for logging method execution and performance metrics
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Intercept method execution
   * @param context The execution context
   * @param next The next call handler
   * @returns The observable result
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get start time
    const startTime = Date.now();

    // Get request
    const request = this.getRequest(context);
    if (!request) {
      return next.handle();
    }

    // Extract request ID
    const requestId = RequestIdUtil.extractRequestId(request.headers);

    // Set request ID in logging service
    this.loggingService.setRequestId(requestId);

    // Get context information
    const contextType = context.getType();
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    // Set context in logging service
    this.loggingService.setContext(controllerName);

    // Create type-safe HTTP metadata for method execution
    const executionMetadata: HttpLogMetadata = {
      method: String(contextType),
      url: `${controllerName}.${handlerName}`,
      requestId,
    };

    // Log method execution start with type-safe metadata
    this.loggingService.debug<HttpLogMetadata>(
      `${contextType} | ${controllerName}.${handlerName} | Execution started`,
      undefined,
      executionMetadata,
    );

    // Handle method execution
    return next.handle().pipe(
      tap(() => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Create type-safe HTTP metadata for successful execution
        const successMetadata: HttpLogMetadata = {
          method: String(contextType),
          url: `${controllerName}.${handlerName}`,
          statusCode: 200, // Assume success
          duration,
          requestId,
        };

        // Log successful execution with type-safe metadata
        this.loggingService.debug<HttpLogMetadata>(
          `${contextType} | ${controllerName}.${handlerName} | Execution completed (${duration}ms)`,
          undefined,
          successMetadata,
        );
      }),
      catchError((error: Error) => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Create type-safe error metadata
        const errorMetadata: ErrorLogMetadata = {
          errorName: error.name || 'Error',
          errorCode: 'EXECUTION_ERROR',
          stack: error.stack,
          requestId,
        };

        // Log error with type-safe metadata
        this.loggingService.error<ErrorLogMetadata>(
          `${contextType} | ${controllerName}.${handlerName} | Execution failed (${duration}ms): ${error.message}`,
          error.stack,
          undefined,
          errorMetadata,
        );

        // Re-throw the error
        throw error;
      }),
    );
  }

  /**
   * Get request object from execution context
   * @param context The execution context
   * @returns The request object or null if not available
   */
  private getRequest(context: ExecutionContext): Record<string, any> | null {
    // HTTP context
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }

    // RPC context
    if (context.getType() === 'rpc') {
      return context.switchToRpc().getContext();
    }

    // WebSocket context
    if (context.getType() === 'ws') {
      return context.switchToWs().getClient();
    }

    return null;
  }

  // Removed unused getDataSize method
}
