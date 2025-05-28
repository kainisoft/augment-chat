import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { StringValidator, StringManipulator } from '@app/common';
import { FastifyRequest } from 'fastify';

/**
 * Security Utils Service
 *
 * Provides common security utilities and helper functions
 * that can be used across all microservices.
 */
@Injectable()
export class SecurityUtilsService {
  /**
   * Generate a cryptographically secure random string
   *
   * @param length - Length of the random string
   * @param encoding - Encoding format (default: 'hex')
   * @returns Random string
   */
  generateSecureRandom(
    length: number = 32,
    encoding: BufferEncoding = 'hex',
  ): string {
    const bytes = Math.ceil(length / 2);
    return crypto.randomBytes(bytes).toString(encoding).slice(0, length);
  }

  /**
   * Generate a secure session ID
   *
   * @returns Secure session ID
   */
  generateSessionId(): string {
    return `sess_${this.generateSecureRandom(32)}`;
  }

  /**
   * Generate a secure correlation ID for request tracking
   *
   * @returns Secure correlation ID
   */
  generateCorrelationId(): string {
    return `req_${this.generateSecureRandom(16)}`;
  }

  /**
   * Hash a password using a secure algorithm
   *
   * @param password - Plain text password
   * @param saltRounds - Number of salt rounds (default: 12)
   * @returns Hashed password
   */
  async hashPassword(
    password: string,
    saltRounds: number = 12,
  ): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   *
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches, false otherwise
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }

  /**
   * Sanitize input string to prevent XSS and injection attacks
   *
   * @param input - Input string to sanitize
   * @returns Sanitized string
   */
  sanitizeInput(input: string): string {
    return StringManipulator.sanitizeInput(input);
  }

  /**
   * Validate and sanitize email address
   *
   * @param email - Email address to validate and sanitize
   * @returns Sanitized email or null if invalid
   */
  validateAndSanitizeEmail(email: string): string | null {
    return StringManipulator.validateAndSanitizeEmail(email);
  }

  /**
   * Generate a secure token for password reset, email verification, etc.
   *
   * @param length - Token length (default: 64)
   * @returns Secure token
   */
  generateSecureToken(length: number = 64): string {
    return this.generateSecureRandom(length, 'base64url');
  }

  /**
   * Create a hash of sensitive data for logging purposes
   *
   * @param data - Sensitive data to hash
   * @returns SHA256 hash of the data
   */
  createDataHash(data: string): string {
    return StringManipulator.createHash(data);
  }

  /**
   * Mask sensitive data for logging
   *
   * @param data - Data to mask
   * @param visibleChars - Number of characters to show at start and end
   * @returns Masked data
   */
  maskSensitiveData(data: string, visibleChars: number = 2): string {
    return StringManipulator.maskSensitiveData(data, visibleChars);
  }

  /**
   * Check if a string contains potentially malicious content
   *
   * @param input - Input string to check
   * @returns True if potentially malicious, false otherwise
   */
  containsMaliciousContent(input: string): boolean {
    return StringValidator.containsMaliciousContent(input);
  }

  /**
   * Generate a time-based one-time password (TOTP) secret
   *
   * @returns Base32 encoded secret
   */
  generateTOTPSecret(): string {
    const secret = crypto.randomBytes(20);
    return this.base32Encode(secret);
  }

  /**
   * Encode buffer to base32
   *
   * @param buffer - Buffer to encode
   * @returns Base32 encoded string
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   *
   * @param a - First string
   * @param b - Second string
   * @returns True if strings are equal, false otherwise
   */
  constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Extract IP address from request with proxy support
   *
   * @param req - Request object
   * @returns IP address
   */
  extractIPAddress(req: FastifyRequest): string {
    // Check for forwarded IP (from proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // Take the first IP if multiple are present
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return forwardedStr.split(',')[0].trim();
    }

    // Check for real IP header
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
      const realIPStr = Array.isArray(realIP) ? realIP[0] : realIP;
      return realIPStr;
    }

    // Fallback to request IP or unknown
    return req.ip || 'unknown';
  }

  /**
   * Generate a secure API key
   *
   * @param prefix - Optional prefix for the API key
   * @returns Secure API key
   */
  generateAPIKey(prefix?: string): string {
    const key = this.generateSecureRandom(32);
    return prefix ? `${prefix}_${key}` : key;
  }
}
