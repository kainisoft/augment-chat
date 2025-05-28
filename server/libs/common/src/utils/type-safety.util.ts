/**
 * Type Safety Utilities
 *
 * Comprehensive type safety utilities to improve type checking,
 * validation, and runtime type safety across shared modules.
 */

/**
 * Type guard utilities for runtime type checking
 */
export class TypeGuards {
  /**
   * Check if value is a string
   * @param value - Value to check
   * @returns True if value is a string
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /**
   * Check if value is a non-empty string
   * @param value - Value to check
   * @returns True if value is a non-empty string
   */
  static isNonEmptyString(value: unknown): value is string {
    return this.isString(value) && value.length > 0;
  }

  /**
   * Check if value is a number
   * @param value - Value to check
   * @returns True if value is a number
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Check if value is a positive number
   * @param value - Value to check
   * @returns True if value is a positive number
   */
  static isPositiveNumber(value: unknown): value is number {
    return this.isNumber(value) && value > 0;
  }

  /**
   * Check if value is a boolean
   * @param value - Value to check
   * @returns True if value is a boolean
   */
  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  /**
   * Check if value is an object (not null, not array)
   * @param value - Value to check
   * @returns True if value is an object
   */
  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Check if value is an array
   * @param value - Value to check
   * @returns True if value is an array
   */
  static isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  /**
   * Check if value is a non-empty array
   * @param value - Value to check
   * @returns True if value is a non-empty array
   */
  static isNonEmptyArray(value: unknown): value is unknown[] {
    return this.isArray(value) && value.length > 0;
  }

  /**
   * Check if value is a function
   * @param value - Value to check
   * @returns True if value is a function
   */
  static isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  }

  /**
   * Check if value is null or undefined
   * @param value - Value to check
   * @returns True if value is null or undefined
   */
  static isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  /**
   * Check if value is defined (not null or undefined)
   * @param value - Value to check
   * @returns True if value is defined
   */
  static isDefined<T>(value: T | null | undefined): value is T {
    return !this.isNullish(value);
  }

  /**
   * Check if value is a valid Date object
   * @param value - Value to check
   * @returns True if value is a valid Date
   */
  static isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Check if value is a Promise
   * @param value - Value to check
   * @returns True if value is a Promise
   */
  static isPromise(value: unknown): value is Promise<unknown> {
    return (
      value instanceof Promise ||
      (this.isObject(value) &&
        this.isFunction((value as any).then) &&
        this.isFunction((value as any).catch))
    );
  }

  /**
   * Check if value has a specific property
   * @param value - Value to check
   * @param property - Property name to check for
   * @returns True if value has the property
   */
  static hasProperty<T extends string>(
    value: unknown,
    property: T,
  ): value is Record<T, unknown> {
    return this.isObject(value) && property in value;
  }

  /**
   * Check if value has all specified properties
   * @param value - Value to check
   * @param properties - Property names to check for
   * @returns True if value has all properties
   */
  static hasProperties<T extends string>(
    value: unknown,
    properties: T[],
  ): value is Record<T, unknown> {
    return this.isObject(value) && properties.every((prop) => prop in value);
  }
}

/**
 * Type assertion utilities for safe type casting
 */
export class TypeAssertions {
  /**
   * Assert that value is a string
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as a string
   * @throws Error if value is not a string
   */
  static assertString(value: unknown, message = 'Expected string'): string {
    if (!TypeGuards.isString(value)) {
      throw new TypeError(`${message}, got ${typeof value}`);
    }
    return value;
  }

  /**
   * Assert that value is a non-empty string
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as a non-empty string
   * @throws Error if value is not a non-empty string
   */
  static assertNonEmptyString(
    value: unknown,
    message = 'Expected non-empty string',
  ): string {
    if (!TypeGuards.isNonEmptyString(value)) {
      throw new TypeError(
        `${message}, got ${typeof value} with length ${(value as any)?.length || 0}`,
      );
    }
    return value;
  }

  /**
   * Assert that value is a number
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as a number
   * @throws Error if value is not a number
   */
  static assertNumber(value: unknown, message = 'Expected number'): number {
    if (!TypeGuards.isNumber(value)) {
      throw new TypeError(`${message}, got ${typeof value}`);
    }
    return value;
  }

  /**
   * Assert that value is a positive number
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as a positive number
   * @throws Error if value is not a positive number
   */
  static assertPositiveNumber(
    value: unknown,
    message = 'Expected positive number',
  ): number {
    if (!TypeGuards.isPositiveNumber(value)) {
      throw new TypeError(
        `${message}, got ${typeof value} with value ${value}`,
      );
    }
    return value;
  }

  /**
   * Assert that value is an object
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as an object
   * @throws Error if value is not an object
   */
  static assertObject(
    value: unknown,
    message = 'Expected object',
  ): Record<string, unknown> {
    if (!TypeGuards.isObject(value)) {
      throw new TypeError(`${message}, got ${typeof value}`);
    }
    return value;
  }

  /**
   * Assert that value is an array
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as an array
   * @throws Error if value is not an array
   */
  static assertArray(value: unknown, message = 'Expected array'): unknown[] {
    if (!TypeGuards.isArray(value)) {
      throw new TypeError(`${message}, got ${typeof value}`);
    }
    return value;
  }

  /**
   * Assert that value is defined (not null or undefined)
   * @param value - Value to assert
   * @param message - Error message if assertion fails
   * @returns The value as defined
   * @throws Error if value is null or undefined
   */
  static assertDefined<T>(
    value: T | null | undefined,
    message = 'Expected defined value',
  ): T {
    if (TypeGuards.isNullish(value)) {
      throw new TypeError(`${message}, got ${value}`);
    }
    return value;
  }

  /**
   * Assert that value has a specific property
   * @param value - Value to assert
   * @param property - Property name to check for
   * @param message - Error message if assertion fails
   * @returns The value with the property
   * @throws Error if value doesn't have the property
   */
  static assertHasProperty<T extends string>(
    value: unknown,
    property: T,
    message = `Expected object with property '${property}'`,
  ): Record<T, unknown> {
    if (!TypeGuards.hasProperty(value, property)) {
      throw new TypeError(`${message}, got ${typeof value}`);
    }
    return value;
  }
}

/**
 * Type conversion utilities for safe type conversion
 */
export class TypeConverters {
  /**
   * Safely convert value to string
   * @param value - Value to convert
   * @param defaultValue - Default value if conversion fails
   * @returns String value or default
   */
  static toString(value: unknown, defaultValue = ''): string {
    if (TypeGuards.isString(value)) {
      return value;
    }

    if (TypeGuards.isNullish(value)) {
      return defaultValue;
    }

    try {
      return String(value);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Safely convert value to number
   * @param value - Value to convert
   * @param defaultValue - Default value if conversion fails
   * @returns Number value or default
   */
  static toNumber(value: unknown, defaultValue = 0): number {
    if (TypeGuards.isNumber(value)) {
      return value;
    }

    if (TypeGuards.isString(value)) {
      const parsed = Number(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
  }

  /**
   * Safely convert value to boolean
   * @param value - Value to convert
   * @param defaultValue - Default value if conversion fails
   * @returns Boolean value or default
   */
  static toBoolean(value: unknown, defaultValue = false): boolean {
    if (TypeGuards.isBoolean(value)) {
      return value;
    }

    if (TypeGuards.isString(value)) {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') {
        return true;
      }
      if (lower === 'false' || lower === '0' || lower === 'no') {
        return false;
      }
    }

    if (TypeGuards.isNumber(value)) {
      return value !== 0;
    }

    return defaultValue;
  }

  /**
   * Safely convert value to array
   * @param value - Value to convert
   * @param defaultValue - Default value if conversion fails
   * @returns Array value or default
   */
  static toArray<T>(value: unknown, defaultValue: T[] = []): T[] {
    if (TypeGuards.isArray(value)) {
      return value as T[];
    }

    if (TypeGuards.isDefined(value)) {
      return [value as T];
    }

    return defaultValue;
  }
}

/**
 * Export all type safety utilities
 */
export const TypeSafetyUtils = {
  Guards: TypeGuards,
  Assertions: TypeAssertions,
  Converters: TypeConverters,
} as const;
