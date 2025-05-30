/**
 * Date Utilities
 *
 * Centralized date manipulation, validation, and formatting utilities
 * to eliminate duplicate date handling patterns across shared modules.
 */

/**
 * Date validation utilities
 */
export class DateValidator {
  /**
   * Validate ISO 8601 date string format
   * @param dateString - Date string to validate
   * @returns True if valid ISO 8601 format
   */
  static isValidISODate(dateString: string): boolean {
    if (!dateString || typeof dateString !== 'string') return false;

    try {
      const date = new Date(dateString);
      return date.toISOString() === dateString;
    } catch {
      return false;
    }
  }

  /**
   * Validate that a date is not in the future
   * @param dateString - Date string to validate
   * @returns True if date is not in the future
   */
  static isNotFuture(dateString: string): boolean {
    if (!this.isValidISODate(dateString)) return false;

    const date = new Date(dateString);
    const now = new Date();
    return date <= now;
  }

  /**
   * Validate that a date is not in the past
   * @param dateString - Date string to validate
   * @returns True if date is not in the past
   */
  static isNotPast(dateString: string): boolean {
    if (!this.isValidISODate(dateString)) return false;

    const date = new Date(dateString);
    const now = new Date();
    return date >= now;
  }

  /**
   * Validate date range (from <= to)
   * @param fromDate - Start date string
   * @param toDate - End date string
   * @returns True if valid date range
   */
  static isValidDateRange(fromDate: string, toDate: string): boolean {
    if (!this.isValidISODate(fromDate) || !this.isValidISODate(toDate)) {
      return false;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    return from <= to;
  }

  /**
   * Validate that date is within specified age range
   * @param birthDate - Birth date string
   * @param minAge - Minimum age in years
   * @param maxAge - Maximum age in years
   * @returns True if age is within range
   */
  static isValidAge(
    birthDate: string,
    minAge: number = 0,
    maxAge: number = 150,
  ): boolean {
    if (!this.isValidISODate(birthDate)) return false;

    const birth = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();

    // Adjust for birthday not yet occurred this year
    const monthDiff = now.getMonth() - birth.getMonth();
    const dayDiff = now.getDate() - birth.getDate();
    const adjustedAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    return adjustedAge >= minAge && adjustedAge <= maxAge;
  }
}

export type DateUnit =
  | 'days'
  | 'hours'
  | 'minutes'
  | 'seconds'
  | 'milliseconds';

/**
 * Date manipulation utilities
 */
export class DateManipulator {
  /**
   * Add specified amount of time to a date
   * @param date - Base date
   * @param amount - Amount to add
   * @param unit - Time unit ('days', 'hours', 'minutes', 'seconds', 'milliseconds')
   * @returns New date with added time
   */
  static add(date: Date, amount: number, unit: DateUnit): Date {
    const result = new Date(date);

    switch (unit) {
      case 'days':
        result.setDate(result.getDate() + amount);
        break;
      case 'hours':
        result.setHours(result.getHours() + amount);
        break;
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount);
        break;
      case 'milliseconds':
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
    }

    return result;
  }

  /**
   * Subtract specified amount of time from a date
   * @param date - Base date
   * @param amount - Amount to subtract
   * @param unit - Time unit
   * @returns New date with subtracted time
   */
  static subtract(date: Date, amount: number, unit: DateUnit): Date {
    return this.add(date, -amount, unit);
  }

  /**
   * Get start of day (00:00:00.000)
   * @param date - Input date
   * @returns Date at start of day
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day (23:59:59.999)
   * @param date - Input date
   * @returns Date at end of day
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of week (Monday 00:00:00.000)
   * @param date - Input date
   * @returns Date at start of week
   */
  static startOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    result.setDate(diff);
    return this.startOfDay(result);
  }

  /**
   * Get start of month (1st day 00:00:00.000)
   * @param date - Input date
   * @returns Date at start of month
   */
  static startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.startOfDay(result);
  }

  /**
   * Get start of year (January 1st 00:00:00.000)
   * @param date - Input date
   * @returns Date at start of year
   */
  static startOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(0, 1);
    return this.startOfDay(result);
  }
}

/**
 * Date formatting utilities
 */
export class DateFormatter {
  /**
   * Format date to ISO 8601 string
   * @param date - Date to format
   * @returns ISO 8601 formatted string
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Format date to human readable string
   * @param date - Date to format
   * @param options - Intl.DateTimeFormat options
   * @returns Formatted date string
   */
  static toHumanReadable(
    date: Date,
    options?: Intl.DateTimeFormatOptions,
  ): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Format date to relative time string (e.g., "2 hours ago", "in 3 days")
   * @param date - Date to format
   * @param baseDate - Base date for comparison (default: now)
   * @returns Relative time string
   */
  static toRelativeTime(date: Date, baseDate: Date = new Date()): string {
    const diffMs = date.getTime() - baseDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const isPast = diffMs < 0;
    const abs = Math.abs;

    if (abs(diffYears) >= 1) {
      return isPast
        ? `${abs(diffYears)} year${abs(diffYears) > 1 ? 's' : ''} ago`
        : `in ${abs(diffYears)} year${abs(diffYears) > 1 ? 's' : ''}`;
    }

    if (abs(diffMonths) >= 1) {
      return isPast
        ? `${abs(diffMonths)} month${abs(diffMonths) > 1 ? 's' : ''} ago`
        : `in ${abs(diffMonths)} month${abs(diffMonths) > 1 ? 's' : ''}`;
    }

    if (abs(diffWeeks) >= 1) {
      return isPast
        ? `${abs(diffWeeks)} week${abs(diffWeeks) > 1 ? 's' : ''} ago`
        : `in ${abs(diffWeeks)} week${abs(diffWeeks) > 1 ? 's' : ''}`;
    }

    if (abs(diffDays) >= 1) {
      return isPast
        ? `${abs(diffDays)} day${abs(diffDays) > 1 ? 's' : ''} ago`
        : `in ${abs(diffDays)} day${abs(diffDays) > 1 ? 's' : ''}`;
    }

    if (abs(diffHours) >= 1) {
      return isPast
        ? `${abs(diffHours)} hour${abs(diffHours) > 1 ? 's' : ''} ago`
        : `in ${abs(diffHours)} hour${abs(diffHours) > 1 ? 's' : ''}`;
    }

    if (abs(diffMinutes) >= 1) {
      return isPast
        ? `${abs(diffMinutes)} minute${abs(diffMinutes) > 1 ? 's' : ''} ago`
        : `in ${abs(diffMinutes)} minute${abs(diffMinutes) > 1 ? 's' : ''}`;
    }

    return 'just now';
  }

  /**
   * Format duration between two dates
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Formatted duration string
   */
  static formatDuration(startDate: Date, endDate: Date): string {
    const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      const hours = diffHours % 24;
      return `${diffDays}d ${hours}h`;
    }

    if (diffHours > 0) {
      const minutes = diffMinutes % 60;
      return `${diffHours}h ${minutes}m`;
    }

    if (diffMinutes > 0) {
      const seconds = diffSeconds % 60;
      return `${diffMinutes}m ${seconds}s`;
    }

    return `${diffSeconds}s`;
  }

  /**
   * Format date for logging purposes
   * @param date - Date to format
   * @returns Log-friendly date string
   */
  static toLogFormat(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
  }

  /**
   * Format date for filename usage
   * @param date - Date to format
   * @returns Filename-safe date string
   */
  static toFilenameFormat(date: Date): string {
    return date
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .replace('Z', '');
  }
}

/**
 * Date calculation utilities
 */
export class DateCalculator {
  /**
   * Calculate age in years from birth date
   * @param birthDate - Birth date
   * @param referenceDate - Reference date (default: now)
   * @returns Age in years
   */
  static calculateAge(
    birthDate: Date,
    referenceDate: Date = new Date(),
  ): number {
    const age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    const dayDiff = referenceDate.getDate() - birthDate.getDate();

    // Adjust if birthday hasn't occurred this year
    return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  }

  /**
   * Calculate business days between two dates (excluding weekends)
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Number of business days
   */
  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;

    while (start <= end) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday (0) or Saturday (6)
        businessDays++;
      }
      start.setDate(start.getDate() + 1);
    }

    return businessDays;
  }

  /**
   * Get the next occurrence of a specific day of the week
   * @param date - Base date
   * @param dayOfWeek - Target day of week (0 = Sunday, 1 = Monday, etc.)
   * @returns Next occurrence of the specified day
   */
  static getNextDayOfWeek(date: Date, dayOfWeek: number): Date {
    const result = new Date(date);
    const currentDay = result.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;

    if (daysUntilTarget === 0) {
      result.setDate(result.getDate() + 7); // Next week if it's the same day
    } else {
      result.setDate(result.getDate() + daysUntilTarget);
    }

    return result;
  }
}

/**
 * Export all date utilities for easy access
 */
export const DateUtils = {
  Validator: DateValidator,
  Manipulator: DateManipulator,
  Formatter: DateFormatter,
  Calculator: DateCalculator,
} as const;
