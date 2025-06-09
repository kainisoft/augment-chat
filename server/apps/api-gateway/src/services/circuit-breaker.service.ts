import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
}

/**
 * Circuit Breaker Service
 *
 * Implements circuit breaker pattern to handle service failures gracefully.
 * Prevents cascading failures by temporarily blocking requests to failing services.
 *
 * Phase 2, Step 3: Service Discovery and Routing - Circuit Breaker Pattern
 */
@Injectable()
export class CircuitBreakerService {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly config: CircuitBreakerConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(CircuitBreakerService.name);

    this.config = {
      failureThreshold: this.configService.get<number>(
        'CIRCUIT_BREAKER_FAILURE_THRESHOLD',
        5,
      ),
      recoveryTimeout: this.configService.get<number>(
        'CIRCUIT_BREAKER_RECOVERY_TIMEOUT_MS',
        60000, // 1 minute
      ),
      monitoringPeriod: this.configService.get<number>(
        'CIRCUIT_BREAKER_MONITORING_PERIOD_MS',
        300000, // 5 minutes
      ),
    };

    this.loggingService.log(
      'Circuit Breaker Service initialized',
      'CircuitBreakerInit',
      this.config,
    );
  }

  /**
   * Check if a request should be allowed through the circuit breaker
   */
  async canExecute(serviceKey: string): Promise<boolean> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceKey);
    const now = new Date();

    switch (circuitBreaker.state) {
      case 'CLOSED':
        // Normal operation - allow all requests
        return true;

      case 'OPEN':
        // Circuit is open - check if recovery timeout has passed
        if (
          circuitBreaker.nextAttemptTime &&
          now >= circuitBreaker.nextAttemptTime
        ) {
          // Transition to HALF_OPEN state
          circuitBreaker.state = 'HALF_OPEN';
          this.loggingService.log(
            `Circuit breaker transitioning to HALF_OPEN: ${serviceKey}`,
            'CircuitBreakerTransition',
          );
          return true;
        }
        // Still in recovery period - reject request
        return false;

      case 'HALF_OPEN':
        // Allow limited requests to test service recovery
        return true;

      default:
        return true;
    }
  }

  /**
   * Record a successful request
   */
  async recordSuccess(serviceKey: string): Promise<void> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceKey);

    if (circuitBreaker.state === 'HALF_OPEN') {
      // Service has recovered - close the circuit
      circuitBreaker.state = 'CLOSED';
      circuitBreaker.failureCount = 0;
      circuitBreaker.lastFailureTime = null;
      circuitBreaker.nextAttemptTime = null;

      this.loggingService.log(
        `Circuit breaker closed (service recovered): ${serviceKey}`,
        'CircuitBreakerRecovery',
      );
    } else if (circuitBreaker.state === 'CLOSED') {
      // Reset failure count on successful request
      circuitBreaker.failureCount = 0;
    }
  }

  /**
   * Record a failed request
   */
  async recordFailure(serviceKey: string, error?: string): Promise<void> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceKey);
    const now = new Date();

    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = now;

    this.loggingService.warn(
      `Circuit breaker recorded failure: ${serviceKey}`,
      'CircuitBreakerFailure',
      {
        failureCount: circuitBreaker.failureCount,
        threshold: this.config.failureThreshold,
        error,
      },
    );

    if (circuitBreaker.state === 'HALF_OPEN') {
      // Failed during recovery attempt - reopen circuit
      circuitBreaker.state = 'OPEN';
      circuitBreaker.nextAttemptTime = new Date(
        now.getTime() + this.config.recoveryTimeout,
      );

      this.loggingService.warn(
        `Circuit breaker reopened (recovery failed): ${serviceKey}`,
        'CircuitBreakerReopen',
      );
    } else if (
      circuitBreaker.state === 'CLOSED' &&
      circuitBreaker.failureCount >= this.config.failureThreshold
    ) {
      // Threshold exceeded - open circuit
      circuitBreaker.state = 'OPEN';
      circuitBreaker.nextAttemptTime = new Date(
        now.getTime() + this.config.recoveryTimeout,
      );

      this.loggingService.error(
        `Circuit breaker opened (threshold exceeded): ${serviceKey}`,
        undefined,
        'CircuitBreakerOpen',
        {
          failureCount: circuitBreaker.failureCount,
          threshold: this.config.failureThreshold,
        },
      );
    }
  }

  /**
   * Get circuit breaker state for a service
   */
  getState(serviceKey: string): CircuitBreakerState {
    return this.getOrCreateCircuitBreaker(serviceKey);
  }

  /**
   * Get all circuit breaker states
   */
  getAllStates(): Map<string, CircuitBreakerState> {
    return new Map(this.circuitBreakers);
  }

  /**
   * Reset circuit breaker for a service
   */
  async reset(serviceKey: string): Promise<void> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(serviceKey);

    circuitBreaker.state = 'CLOSED';
    circuitBreaker.failureCount = 0;
    circuitBreaker.lastFailureTime = null;
    circuitBreaker.nextAttemptTime = null;

    this.loggingService.log(
      `Circuit breaker manually reset: ${serviceKey}`,
      'CircuitBreakerReset',
    );
  }

  /**
   * Reset all circuit breakers
   */
  async resetAll(): Promise<void> {
    const serviceKeys = Array.from(this.circuitBreakers.keys());

    for (const serviceKey of serviceKeys) {
      await this.reset(serviceKey);
    }

    this.loggingService.log(
      `All circuit breakers reset (${serviceKeys.length} services)`,
      'CircuitBreakerResetAll',
    );
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    serviceKey: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const canExecute = await this.canExecute(serviceKey);

    if (!canExecute) {
      this.loggingService.warn(
        `Circuit breaker blocked request: ${serviceKey}`,
        'CircuitBreakerBlocked',
      );

      if (fallback) {
        return await fallback();
      }

      throw new Error(
        `Service ${serviceKey} is currently unavailable (circuit breaker open)`,
      );
    }

    try {
      const result = await operation();
      await this.recordSuccess(serviceKey);
      return result;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.recordFailure(serviceKey, errorMessage);
      throw error;
    }
  }

  /**
   * Get or create circuit breaker for a service
   */
  private getOrCreateCircuitBreaker(serviceKey: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceKey)) {
      this.circuitBreakers.set(serviceKey, {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
      });

      this.loggingService.debug(
        `Created new circuit breaker: ${serviceKey}`,
        'CircuitBreakerCreate',
      );
    }

    return this.circuitBreakers.get(serviceKey)!;
  }

  /**
   * Get circuit breaker statistics
   */
  getStatistics(): {
    totalCircuitBreakers: number;
    openCircuitBreakers: number;
    halfOpenCircuitBreakers: number;
    closedCircuitBreakers: number;
  } {
    const states = Array.from(this.circuitBreakers.values());

    return {
      totalCircuitBreakers: states.length,
      openCircuitBreakers: states.filter((cb) => cb.state === 'OPEN').length,
      halfOpenCircuitBreakers: states.filter((cb) => cb.state === 'HALF_OPEN')
        .length,
      closedCircuitBreakers: states.filter((cb) => cb.state === 'CLOSED')
        .length,
    };
  }
}
