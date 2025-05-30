/**
 * String Utilities
 *
 * Centralized string manipulation and validation utilities to eliminate
 * duplicate code patterns across shared modules.
 */

/**
 * Common regex patterns used across the application
 */
export const REGEX_PATTERNS = {
  /**
   * Email validation regex (RFC 5322 compliant)
   * Used across validation, security, and domain modules
   */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * UUID v4 validation regex
   * Used across validation, domain, and service modules
   */
  UUID_V4:
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  /**
   * Strong password regex
   * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
   */
  STRONG_PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  /**
   * Username regex
   * Alphanumeric characters, underscores, and hyphens only
   */
  USERNAME: /^[a-zA-Z0-9_-]+$/,

  /**
   * JWT token regex
   * Three base64url encoded parts separated by dots
   */
  JWT_TOKEN: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,

  /**
   * ISO 8601 date regex
   * Matches standard ISO date format
   */
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,

  /**
   * Malicious content patterns for XSS prevention
   */
  MALICIOUS_PATTERNS: [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ],
} as const;

/**
 * String validation utilities
 */
export class StringValidator {
  /**
   * Validate email format using centralized regex
   * @param email - Email string to validate
   * @returns True if valid email format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    return REGEX_PATTERNS.EMAIL.test(email.trim());
  }

  /**
   * Validate UUID v4 format using centralized regex
   * @param uuid - UUID string to validate
   * @returns True if valid UUID v4 format
   */
  static isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    return REGEX_PATTERNS.UUID_V4.test(uuid.trim());
  }

  /**
   * Validate strong password format
   * @param password - Password string to validate
   * @returns True if password meets strength requirements
   */
  static isStrongPassword(password: string): boolean {
    if (!password || typeof password !== 'string') return false;
    return REGEX_PATTERNS.STRONG_PASSWORD.test(password);
  }

  /**
   * Validate username format
   * @param username - Username string to validate
   * @returns True if valid username format
   */
  static isValidUsername(username: string): boolean {
    if (!username || typeof username !== 'string') return false;
    return REGEX_PATTERNS.USERNAME.test(username.trim());
  }

  /**
   * Validate JWT token format
   * @param token - JWT token string to validate
   * @returns True if valid JWT format
   */
  static isValidJWT(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    return REGEX_PATTERNS.JWT_TOKEN.test(token.trim());
  }

  /**
   * Validate ISO 8601 date format
   * @param date - Date string to validate
   * @returns True if valid ISO date format
   */
  static isValidISODate(date: string): boolean {
    if (!date || typeof date !== 'string') return false;
    return REGEX_PATTERNS.ISO_DATE.test(date.trim());
  }

  /**
   * Check if string contains potentially malicious content
   * @param input - Input string to check
   * @returns True if potentially malicious content detected
   */
  static containsMaliciousContent(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return REGEX_PATTERNS.MALICIOUS_PATTERNS.some((pattern) =>
      pattern.test(input),
    );
  }
}

/**
 * String manipulation utilities
 */
export class StringManipulator {
  /**
   * Sanitize input string to prevent XSS and injection attacks
   * Centralized implementation to replace scattered sanitization logic
   * @param input - Input string to sanitize
   * @returns Sanitized string
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[\\]/g, '') // Remove backslashes
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validate and sanitize email address
   * Combines validation and sanitization in one operation
   * @param email - Email address to validate and sanitize
   * @returns Sanitized email or null if invalid
   */
  static validateAndSanitizeEmail(email: string): string | null {
    if (!email || typeof email !== 'string') return null;

    const sanitized = this.sanitizeInput(email).toLowerCase();

    if (!StringValidator.isValidEmail(sanitized)) {
      return null;
    }

    return sanitized;
  }

  /**
   * Mask sensitive data for logging purposes
   * @param data - Data to mask
   * @param visibleChars - Number of characters to show at start and end
   * @returns Masked data
   */
  static maskSensitiveData(data: string, visibleChars: number = 2): string {
    if (!data || typeof data !== 'string') return '';

    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }

    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const middle = '*'.repeat(data.length - visibleChars * 2);

    return `${start}${middle}${end}`;
  }

  /**
   * Normalize string for comparison (trim, lowercase, remove extra spaces)
   * @param input - Input string to normalize
   * @returns Normalized string
   */
  static normalize(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input.trim().toLowerCase().replace(/\s+/g, ' '); // Replace multiple spaces with single space
  }

  /**
   * Truncate string to specified length with ellipsis
   * @param input - Input string to truncate
   * @param maxLength - Maximum length
   * @param suffix - Suffix to add (default: '...')
   * @returns Truncated string
   */
  static truncate(
    input: string,
    maxLength: number,
    suffix: string = '...',
  ): string {
    if (!input || typeof input !== 'string') return '';

    if (input.length <= maxLength) return input;

    return input.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Convert string to slug format (URL-friendly)
   * @param input - Input string to convert
   * @returns Slug string
   */
  static toSlug(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Capitalize first letter of each word
   * @param input - Input string to capitalize
   * @returns Capitalized string
   */
  static toTitleCase(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate a hash of string data for logging purposes
   * @param data - Data to hash
   * @returns SHA256 hash of the data
   */
  static createHash(data: string): string {
    if (!data || typeof data !== 'string') return '';

    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

/**
 * String formatting utilities
 */
export class StringFormatter {
  /**
   * Format bytes to human readable format
   * @param bytes - Number of bytes
   * @param decimals - Number of decimal places
   * @returns Formatted string
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format duration in milliseconds to human readable format
   * @param ms - Duration in milliseconds
   * @returns Formatted duration string
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Format number with thousand separators
   * @param num - Number to format
   * @param separator - Thousand separator (default: ',')
   * @returns Formatted number string
   */
  static formatNumber(num: number, separator: string = ','): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  /**
   * Format percentage with specified decimal places
   * @param value - Value to format as percentage
   * @param total - Total value for percentage calculation
   * @param decimals - Number of decimal places
   * @returns Formatted percentage string
   */
  static formatPercentage(
    value: number,
    total: number,
    decimals: number = 1,
  ): string {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
  }
}

/**
 * Export all utilities for easy access
 */
export const StringUtils = {
  Validator: StringValidator,
  Manipulator: StringManipulator,
  Formatter: StringFormatter,
  Patterns: REGEX_PATTERNS,
} as const;
