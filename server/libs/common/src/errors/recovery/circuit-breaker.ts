import { AppError, ErrorCode } from '../app-error';
import { ErrorLoggerService } from '@app/logging';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation, requests pass through
  OPEN = 'OPEN', // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN', // Testing if service is back online
}

/**
 * Circuit breaker options
 */
export interface CircuitBreakerOptions {
  /**
   * Name of the circuit breaker
   */
  name: string;

  /**
   * Number of failures before opening the circuit
   * @default 5
   */
  failureThreshold?: number;

  /**
   * Time in milliseconds to keep the circuit open
   * @default 30000 (30 seconds)
   */
  resetTimeout?: number;

  /**
   * Number of successful calls in half-open state to close the circuit
   * @default 2
   */
  successThreshold?: number;

  /**
   * Timeout in milliseconds for the protected function
   * @default 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Function to determine if an error should count as a failure
   * @param error The error
   * @returns Whether to count as a failure
   */
  isFailure?: (error: Error) => boolean;

  /**
   * Error logger service
   */
  logger?: ErrorLoggerService;
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends AppError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(
      message,
      ErrorCode.CIRCUIT_OPEN,
      503, // Service Unavailable
      metadata,
      cause,
    );
  }
}

/**
 * Circuit breaker implementation
 *
 * Implements the circuit breaker pattern to prevent cascading failures
 * when a service is unavailable.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;
  private readonly timeout: number;
  private readonly isFailure: (error: Error) => boolean;
  private readonly logger?: ErrorLoggerService;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30000;
    this.successThreshold = options.successThreshold ?? 2;
    this.timeout = options.timeout ?? 10000;
    this.isFailure = options.isFailure ?? (() => true);
    this.logger = options.logger;
  }

  /**
   * Execute a function with circuit breaker protection
   * @param fn The function to execute
   * @returns The function result
   * @throws CircuitBreakerError if the circuit is open
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.checkState();

    if (this.state === CircuitState.OPEN) {
      this.logStateChange('Circuit is open, failing fast');
      throw new CircuitBreakerError(`Circuit ${this.options.name} is open`);
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Get the current state of the circuit breaker
   * @returns The circuit state
   */
  getState(): CircuitState {
    this.checkState();
    return this.state;
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;

    this.logStateChange('Circuit reset to CLOSED state');
  }

  /**
   * Force the circuit breaker to open
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.resetTimeout;

    this.logStateChange('Circuit forced to OPEN state');
  }

  /**
   * Check and update the circuit state based on timing
   */
  private checkState(): void {
    const now = Date.now();

    if (this.state === CircuitState.OPEN && now >= this.nextAttemptTime) {
      this.state = CircuitState.HALF_OPEN;
      this.logStateChange('Circuit switched to HALF_OPEN state');
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;

        this.logStateChange('Circuit switched to CLOSED state');
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  /**
   * Handle execution failure
   * @param error The error
   */
  private onFailure(error: Error): void {
    const now = Date.now();
    this.lastFailureTime = now;

    // Check if this error counts as a failure
    if (!this.isFailure(error)) {
      return;
    }

    if (this.state === CircuitState.CLOSED) {
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.nextAttemptTime = now + this.resetTimeout;

        this.logStateChange('Circuit switched to OPEN state');
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = now + this.resetTimeout;
      this.successCount = 0;

      this.logStateChange('Circuit switched back to OPEN state');
    }
  }

  /**
   * Execute a function with a timeout
   * @param fn The function to execute
   * @returns The function result
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Circuit ${this.options.name} timed out after ${this.timeout}ms`,
          ),
        );
      }, this.timeout);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Log state changes
   * @param message The log message
   */
  private logStateChange(message: string): void {
    if (this.logger) {
      this.logger.info(message, `Circuit ${this.options.name} state change`, {
        source: 'CircuitBreaker',
        circuitName: this.options.name,
        state: this.state,
        failureCount: this.failureCount,
        successCount: this.successCount,
      });
    }
  }
}
