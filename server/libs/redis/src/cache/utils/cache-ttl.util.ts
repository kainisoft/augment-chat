/**
 * Cache TTL utilities
 *
 * This file contains utility functions for calculating cache TTL values.
 */

/**
 * Common TTL values in seconds
 */
export enum CacheTTL {
  /**
   * 1 minute
   */
  ONE_MINUTE = 60,

  /**
   * 5 minutes
   */
  FIVE_MINUTES = 300,

  /**
   * 15 minutes
   */
  FIFTEEN_MINUTES = 900,

  /**
   * 30 minutes
   */
  THIRTY_MINUTES = 1800,

  /**
   * 1 hour
   */
  ONE_HOUR = 3600,

  /**
   * 2 hours
   */
  TWO_HOURS = 7200,

  /**
   * 4 hours
   */
  FOUR_HOURS = 14400,

  /**
   * 8 hours
   */
  EIGHT_HOURS = 28800,

  /**
   * 12 hours
   */
  TWELVE_HOURS = 43200,

  /**
   * 1 day
   */
  ONE_DAY = 86400,

  /**
   * 3 days
   */
  THREE_DAYS = 259200,

  /**
   * 1 week
   */
  ONE_WEEK = 604800,

  /**
   * 2 weeks
   */
  TWO_WEEKS = 1209600,

  /**
   * 1 month (30 days)
   */
  ONE_MONTH = 2592000,
}

/**
 * TTL strategy options
 */
export interface TTLStrategyOptions {
  /**
   * Base TTL in seconds
   * @default 300 (5 minutes)
   */
  baseTTL?: number;

  /**
   * Minimum TTL in seconds
   * @default 60 (1 minute)
   */
  minTTL?: number;

  /**
   * Maximum TTL in seconds
   * @default 86400 (1 day)
   */
  maxTTL?: number;

  /**
   * Random factor for TTL jitter (0-1)
   * @default 0.1 (10%)
   */
  jitterFactor?: number;
}

/**
 * Calculate TTL with jitter
 *
 * This adds a small random variation to the TTL to prevent cache stampedes.
 *
 * @param ttl Base TTL in seconds
 * @param jitterFactor Random factor for TTL jitter (0-1)
 * @returns TTL with jitter
 */
export function calculateTTLWithJitter(
  ttl: number,
  jitterFactor = 0.1,
): number {
  // Ensure jitter factor is between 0 and 1
  const factor = Math.max(0, Math.min(1, jitterFactor));

  // Calculate jitter range
  const jitterRange = ttl * factor;

  // Generate random jitter
  const jitter = Math.floor(Math.random() * jitterRange);

  // Add jitter to TTL
  return ttl + jitter;
}

/**
 * Calculate TTL based on data volatility
 *
 * This calculates a TTL based on how frequently the data changes.
 *
 * @param volatility Volatility factor (0-1, where 0 is static and 1 is highly volatile)
 * @param options TTL strategy options
 * @returns Calculated TTL
 */
export function calculateTTLByVolatility(
  volatility: number,
  options: TTLStrategyOptions = {},
): number {
  const {
    baseTTL = CacheTTL.FIVE_MINUTES,
    minTTL = CacheTTL.ONE_MINUTE,
    maxTTL = CacheTTL.ONE_DAY,
    jitterFactor = 0.1,
  } = options;

  // Ensure volatility is between 0 and 1
  const factor = Math.max(0, Math.min(1, volatility));

  // Calculate TTL based on volatility (inverse relationship)
  // High volatility = low TTL, Low volatility = high TTL
  const ttlRange = maxTTL - minTTL;
  const calculatedTTL = Math.floor(maxTTL - factor * ttlRange);

  // Add jitter to prevent cache stampedes
  return calculateTTLWithJitter(calculatedTTL, jitterFactor);
}

/**
 * Calculate TTL based on access frequency
 *
 * This calculates a TTL based on how frequently the data is accessed.
 *
 * @param frequency Access frequency factor (0-1, where 0 is rarely accessed and 1 is frequently accessed)
 * @param options TTL strategy options
 * @returns Calculated TTL
 */
export function calculateTTLByAccessFrequency(
  frequency: number,
  options: TTLStrategyOptions = {},
): number {
  const {
    baseTTL = CacheTTL.FIVE_MINUTES,
    minTTL = CacheTTL.ONE_MINUTE,
    maxTTL = CacheTTL.ONE_DAY,
    jitterFactor = 0.1,
  } = options;

  // Ensure frequency is between 0 and 1
  const factor = Math.max(0, Math.min(1, frequency));

  // Calculate TTL based on access frequency (direct relationship)
  // High frequency = high TTL, Low frequency = low TTL
  const ttlRange = maxTTL - minTTL;
  const calculatedTTL = Math.floor(minTTL + factor * ttlRange);

  // Add jitter to prevent cache stampedes
  return calculateTTLWithJitter(calculatedTTL, jitterFactor);
}

/**
 * Calculate TTL based on data size
 *
 * This calculates a TTL based on the size of the data.
 *
 * @param sizeInBytes Size of the data in bytes
 * @param options TTL strategy options
 * @returns Calculated TTL
 */
export function calculateTTLBySize(
  sizeInBytes: number,
  options: TTLStrategyOptions = {},
): number {
  const {
    baseTTL = CacheTTL.FIVE_MINUTES,
    minTTL = CacheTTL.ONE_MINUTE,
    maxTTL = CacheTTL.ONE_DAY,
    jitterFactor = 0.1,
  } = options;

  // Define size thresholds
  const smallSize = 1024; // 1KB
  const mediumSize = 102400; // 100KB
  const largeSize = 1048576; // 1MB

  let ttl: number;

  // Calculate TTL based on size
  if (sizeInBytes <= smallSize) {
    // Small data can be cached longer
    ttl = maxTTL;
  } else if (sizeInBytes <= mediumSize) {
    // Medium data gets base TTL
    ttl = baseTTL;
  } else if (sizeInBytes <= largeSize) {
    // Large data gets shorter TTL
    ttl = Math.floor(baseTTL / 2);
  } else {
    // Very large data gets minimum TTL
    ttl = minTTL;
  }

  // Add jitter to prevent cache stampedes
  return calculateTTLWithJitter(ttl, jitterFactor);
}
