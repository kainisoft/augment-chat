/**
 * Validation utility functions
 */

/**
 * Check if value is empty (null, undefined, or empty string)
 */
export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

/**
 * Check if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is a valid phone number (basic validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(value: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(value);
}

/**
 * Check if string contains only letters
 */
export function isAlpha(value: string): boolean {
  const alphaRegex = /^[a-zA-Z]+$/;
  return alphaRegex.test(value);
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

/**
 * Check if value is a valid integer
 */
export function isInteger(value: unknown): boolean {
  return Number.isInteger(Number(value));
}

/**
 * Check if value is within a numeric range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if string length is within range
 */
export function isLengthInRange(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Check if password meets strength requirements
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, contains uppercase, lowercase, number, and special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

/**
 * Check if username is valid (alphanumeric and underscores only)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Check if string matches a pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Sanitize string by removing HTML tags
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Escape special regex characters in string
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: unknown): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  if (typeof date === 'string' || typeof date === 'number') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  
  return false;
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string | number): boolean {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate > now;
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string | number): boolean {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate < now;
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * Check if string contains profanity (basic implementation)
 */
export function containsProfanity(text: string): boolean {
  // This is a basic implementation - in production, use a comprehensive profanity filter
  const profanityWords = ['spam', 'scam', 'fake'];
  const lowerText = text.toLowerCase();
  
  return profanityWords.some(word => lowerText.includes(word));
}

/**
 * Validate JSON string
 */
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

/**
 * Check if value is a valid RGB color
 */
export function isValidRgbColor(color: string): boolean {
  const rgbColorRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const match = color.match(rgbColorRegex);
  
  if (!match) return false;
  
  const [, r, g, b] = match;
  return [r, g, b].every(value => {
    const num = parseInt(value, 10);
    return num >= 0 && num <= 255;
  });
}