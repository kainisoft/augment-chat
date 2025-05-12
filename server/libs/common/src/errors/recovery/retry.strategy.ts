import { AppError } from '../app-error';
import { ErrorLoggerService } from '../services/error-logger.service';

/**
 * Retry options
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay between retries in milliseconds
   * @default 1000
   */
  baseDelay?: number;

  /**
   * Whether to use exponential backoff
   * @default true
   */
  exponentialBackoff?: boolean;

  /**
   * Maximum delay between retries in milliseconds
   * @default 30000
   */
  maxDelay?: number;

  /**
   * Jitter factor to add randomness to delay (0-1)
   * @default 0.1
   */
  jitter?: number;

  /**
   * Error types to retry on
   * @default undefined (retry on all errors)
   */
  retryableErrors?: Array<string | Function>;

  /**
   * Error types to not retry on
   * @default undefined
   */
  nonRetryableErrors?: Array<string | Function>;

  /**
   * Function to determine if an error is retryable
   * @param error The error
   * @param attempt The current attempt number
   * @returns Whether to retry
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /**
   * Function to call before each retry
   * @param error The error
   * @param attempt The current attempt number
   * @param delay The delay before the next attempt
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void;

  /**
   * Error logger service
   */
  logger?: ErrorLoggerService;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<
  Omit<
    RetryOptions,
    | 'retryableErrors'
    | 'nonRetryableErrors'
    | 'shouldRetry'
    | 'onRetry'
    | 'logger'
  >
> = {
  maxRetries: 3,
  baseDelay: 1000,
  exponentialBackoff: true,
  maxDelay: 30000,
  jitter: 0.1,
};

/**
 * Retry a function with configurable retry strategy
 *
 * @param fn The function to retry
 * @param options Retry options
 * @returns The function result
 * @throws The last error if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      // Check if we've exceeded max retries
      if (attempt >= opts.maxRetries) {
        throw error;
      }

      // Check if error is retryable
      const shouldRetry = isRetryableError(error, attempt, opts);
      if (!shouldRetry) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(attempt, opts);

      // Log retry attempt
      if (opts.logger) {
        opts.logger.warning(
          error as Error,
          `Retrying operation (attempt ${attempt}/${opts.maxRetries}) after ${delay}ms`,
          { attempt, maxRetries: opts.maxRetries, delay },
        );
      }

      // Call onRetry callback if provided
      if (opts.onRetry) {
        opts.onRetry(error as Error, attempt, delay);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Check if an error is retryable
 * @param error The error
 * @param attempt The current attempt number
 * @param options Retry options
 * @returns Whether to retry
 */
function isRetryableError(
  error: unknown,
  attempt: number,
  options: RetryOptions,
): boolean {
  // Use custom shouldRetry function if provided
  if (options.shouldRetry) {
    return options.shouldRetry(error as Error, attempt);
  }

  // Check non-retryable errors first
  if (options.nonRetryableErrors) {
    for (const errorType of options.nonRetryableErrors) {
      if (typeof errorType === 'string') {
        // Check by error name
        if ((error as Error).name === errorType) {
          return false;
        }
      } else if (error instanceof errorType) {
        // Check by error type
        return false;
      }
    }
  }

  // Check retryable errors if specified
  if (options.retryableErrors) {
    for (const errorType of options.retryableErrors) {
      if (typeof errorType === 'string') {
        // Check by error name
        if ((error as Error).name === errorType) {
          return true;
        }
      } else if (error instanceof errorType) {
        // Check by error type
        return true;
      }
    }

    // If retryable errors are specified and none match, don't retry
    return false;
  }

  // By default, retry all errors
  return true;
}

/**
 * Calculate delay with exponential backoff and jitter
 * @param attempt The current attempt number
 * @param options Retry options
 * @returns Delay in milliseconds
 */
function calculateDelay(
  attempt: number,
  options: RetryOptions & typeof DEFAULT_RETRY_OPTIONS,
): number {
  let delay = options.baseDelay;

  // Apply exponential backoff
  if (options.exponentialBackoff) {
    delay = delay * Math.pow(2, attempt - 1);
  }

  // Apply maximum delay
  delay = Math.min(delay, options.maxDelay);

  // Apply jitter
  if (options.jitter > 0) {
    const jitterAmount = delay * options.jitter;
    delay = delay - jitterAmount + Math.random() * jitterAmount * 2;
  }

  return Math.floor(delay);
}
