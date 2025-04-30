import { Injectable } from '@nestjs/common';
import { LogLevel, LogMessage } from './log-message.interface';

/**
 * Service for validating log messages
 */
@Injectable()
export class LogMessageValidator {
  /**
   * Validate a log message
   * @param message The log message to validate
   * @returns An object with validation result and optional error message
   */
  validate(message: any): { isValid: boolean; error?: string } {
    // Check if message is an object
    if (!message || typeof message !== 'object') {
      return { isValid: false, error: 'Log message must be an object' };
    }

    // Check required fields
    if (!this.validateRequiredFields(message)) {
      return {
        isValid: false,
        error: 'Missing required fields: level, message, service',
      };
    }

    // Validate log level
    if (!this.validateLogLevel(message.level)) {
      return { isValid: false, error: `Invalid log level: ${message.level}` };
    }

    // Validate message field
    if (typeof message.message !== 'string') {
      return { isValid: false, error: 'Message must be a string' };
    }

    // Validate service field
    if (typeof message.service !== 'string') {
      return { isValid: false, error: 'Service must be a string' };
    }

    // All validations passed
    return { isValid: true };
  }

  /**
   * Validate required fields in a log message
   * @param message The log message to validate
   * @returns Whether the message has all required fields
   */
  private validateRequiredFields(message: any): boolean {
    return 'level' in message && 'message' in message && 'service' in message;
  }

  /**
   * Validate log level
   * @param level The log level to validate
   * @returns Whether the log level is valid
   */
  private validateLogLevel(level: any): boolean {
    return Object.values(LogLevel).includes(level as LogLevel);
  }

  /**
   * Sanitize a log message by removing invalid fields and ensuring types
   * @param message The log message to sanitize
   * @returns A sanitized log message
   */
  sanitize(message: any): LogMessage {
    const sanitized: LogMessage = {
      level: message.level,
      message: String(message.message),
      service: String(message.service),
    };

    // Add optional fields if they exist
    if (message.timestamp) sanitized.timestamp = String(message.timestamp);
    if (message.context) sanitized.context = String(message.context);
    if (message.requestId) sanitized.requestId = String(message.requestId);
    if (message.userId) sanitized.userId = String(message.userId);
    if (message.traceId) sanitized.traceId = String(message.traceId);
    if (message.stack) sanitized.stack = String(message.stack);
    if (message.code) sanitized.code = message.code;

    // Add metadata if it exists and is an object
    if (message.metadata && typeof message.metadata === 'object') {
      sanitized.metadata = message.metadata;
    }

    return sanitized;
  }
}
