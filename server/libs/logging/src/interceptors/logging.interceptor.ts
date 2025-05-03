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

    // Log method execution start
    this.loggingService.debug(
      `${contextType} | ${controllerName}.${handlerName} | Execution started`,
      undefined,
      {
        type: contextType,
        controller: controllerName,
        handler: handlerName,
        requestId,
      },
    );

    // Handle method execution
    return next.handle().pipe(
      tap((data) => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Log successful execution
        this.loggingService.debug(
          `${contextType} | ${controllerName}.${handlerName} | Execution completed (${duration}ms)`,
          undefined,
          {
            type: contextType,
            controller: controllerName,
            handler: handlerName,
            duration,
            requestId,
            dataSize: this.getDataSize(data),
          },
        );
      }),
      catchError((error) => {
        // Calculate duration
        const duration = Date.now() - startTime;

        // Log error
        this.loggingService.error(
          `${contextType} | ${controllerName}.${handlerName} | Execution failed (${duration}ms): ${error.message}`,
          error.stack,
          undefined,
          {
            type: contextType,
            controller: controllerName,
            handler: handlerName,
            duration,
            requestId,
            error: error.message,
          },
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

  /**
   * Get the size of data in bytes
   * @param data The data to measure
   * @returns The size in bytes or 0 if not measurable
   */
  private getDataSize(data: any): number {
    try {
      if (!data) {
        return 0;
      }

      // Convert to JSON string and measure length
      const json = JSON.stringify(data);
      return json.length;
    } catch (error) {
      return 0;
    }
  }
}
