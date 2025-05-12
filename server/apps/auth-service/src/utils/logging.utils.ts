import {
  ErrorLoggerService,
  ErrorContext,
  ErrorSeverity,
} from '@app/common/errors/services/error-logger.service';

/**
 * Helper function to log errors with the ErrorLoggerService
 * @param errorLogger The ErrorLoggerService instance
 * @param error The error to log
 * @param message Optional message
 * @param context Error context
 * @param severity Error severity (defaults to ERROR)
 */
export function logError(
  errorLogger: ErrorLoggerService,
  error: Error | string,
  message?: string,
  context?: Partial<ErrorContext>,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
): void {
  switch (severity) {
    case ErrorSeverity.DEBUG:
      errorLogger.debug(error, message, context as ErrorContext);
      break;
    case ErrorSeverity.INFO:
      errorLogger.info(error, message, context as ErrorContext);
      break;
    case ErrorSeverity.WARNING:
      errorLogger.warning(error, message, context as ErrorContext);
      break;
    case ErrorSeverity.CRITICAL:
      errorLogger.critical(error, message, context as ErrorContext);
      break;
    case ErrorSeverity.ERROR:
    default:
      errorLogger.error(error, message, context as ErrorContext);
      break;
  }
}
