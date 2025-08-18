/**
 * Date utility functions
 */

/**
 * Format distance to now (e.g., "2 minutes ago", "in 3 hours")
 */
export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const absDiff = Math.abs(diff);
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  const future = diff < 0;
  const prefix = future ? 'in ' : '';
  const suffix = future ? '' : ' ago';
  
  if (absDiff < minute) {
    return 'just now';
  } else if (absDiff < hour) {
    const minutes = Math.floor(absDiff / minute);
    return `${prefix}${minutes} minute${minutes === 1 ? '' : 's'}${suffix}`;
  } else if (absDiff < day) {
    const hours = Math.floor(absDiff / hour);
    return `${prefix}${hours} hour${hours === 1 ? '' : 's'}${suffix}`;
  } else if (absDiff < week) {
    const days = Math.floor(absDiff / day);
    return `${prefix}${days} day${days === 1 ? '' : 's'}${suffix}`;
  } else if (absDiff < month) {
    const weeks = Math.floor(absDiff / week);
    return `${prefix}${weeks} week${weeks === 1 ? '' : 's'}${suffix}`;
  } else if (absDiff < year) {
    const months = Math.floor(absDiff / month);
    return `${prefix}${months} month${months === 1 ? '' : 's'}${suffix}`;
  } else {
    const years = Math.floor(absDiff / year);
    return `${prefix}${years} year${years === 1 ? '' : 's'}${suffix}`;
  }
}

/**
 * Format timestamp to readable date string
 */
export function formatDate(timestamp: number, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(timestamp).toLocaleDateString(undefined, options || defaultOptions);
}

/**
 * Format timestamp to readable time string
 */
export function formatTime(timestamp: number, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(timestamp).toLocaleTimeString(undefined, options || defaultOptions);
}

/**
 * Format timestamp to readable date and time string
 */
export function formatDateTime(timestamp: number, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Date(timestamp).toLocaleString(undefined, options || defaultOptions);
}

/**
 * Check if timestamp is today
 */
export function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if timestamp is yesterday
 */
export function isYesterday(timestamp: number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);
  
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if timestamp is this week
 */
export function isThisWeek(timestamp: number): boolean {
  const now = new Date();
  const date = new Date(timestamp);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  return date >= startOfWeek;
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get end of day timestamp
 */
export function getEndOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Add days to timestamp
 */
export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/**
 * Add hours to timestamp
 */
export function addHours(timestamp: number, hours: number): number {
  return timestamp + (hours * 60 * 60 * 1000);
}

/**
 * Add minutes to timestamp
 */
export function addMinutes(timestamp: number, minutes: number): number {
  return timestamp + (minutes * 60 * 1000);
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Convert UTC timestamp to local timestamp
 */
export function utcToLocal(utcTimestamp: number): number {
  return utcTimestamp - (getTimezoneOffset() * 60 * 1000);
}

/**
 * Convert local timestamp to UTC timestamp
 */
export function localToUtc(localTimestamp: number): number {
  return localTimestamp + (getTimezoneOffset() * 60 * 1000);
}

/**
 * Parse ISO date string to timestamp
 */
export function parseISODate(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * Convert timestamp to ISO string
 */
export function toISOString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}