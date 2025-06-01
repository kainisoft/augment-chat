export interface RateGuardOptions {
  /**
   * Whether to register the guard globally
   * @default false
   */
  isGlobal?: boolean;
  /** Maximum number of requests allowed */
  maxAttempts: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Block duration in seconds after limit is exceeded */
  blockSeconds: number;
  /** Custom key generator function */
  keyGenerator?: (req: any) => string;
  /** Custom error message */
  message?: string;
}
