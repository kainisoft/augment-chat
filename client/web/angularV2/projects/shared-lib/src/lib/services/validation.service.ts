import { Injectable } from '@angular/core';
import { ValidationResult, ValidationRule, FieldValidation } from '../models/validation.model';
import { User } from '../models/user.model';

/**
 * Input validation service
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  /**
   * Validate message content
   */
  validateMessage(content: string): ValidationResult {
    const errors: string[] = [];
    
    if (!content.trim()) {
      errors.push('Message cannot be empty');
    }
    
    if (content.length > 5000) {
      errors.push('Message too long (max 5000 characters)');
    }
    
    // Content filtering
    if (this.containsInappropriateContent(content)) {
      errors.push('Message contains inappropriate content');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Validate user data
   */
  validateUser(user: Partial<User>): ValidationResult {
    const errors: string[] = [];
    
    if (!user.username || user.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (user.username && user.username.length > 50) {
      errors.push('Username must be less than 50 characters');
    }
    
    if (!user.email || !this.isValidEmail(user.email)) {
      errors.push('Valid email is required');
    }
    
    if (user.username && !this.isValidUsername(user.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Validate email format
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors, warnings };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      warnings.push('Password should contain lowercase letters');
    }
    
    if (!/[A-Z]/.test(password)) {
      warnings.push('Password should contain uppercase letters');
    }
    
    if (!/\d/.test(password)) {
      warnings.push('Password should contain numbers');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      warnings.push('Password should contain special characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Validate field with custom rules
   */
  validateField(value: unknown, validation: FieldValidation): ValidationResult {
    const errors: string[] = [];
    
    // Required validation
    if (validation.required && this.isEmpty(value)) {
      errors.push('This field is required');
      return { isValid: false, errors };
    }
    
    // Skip other validations if value is empty and not required
    if (this.isEmpty(value)) {
      return { isValid: true, errors: [] };
    }
    
    const stringValue = String(value);
    
    // Min length validation
    if (validation.minLength && stringValue.length < validation.minLength) {
      errors.push(`Must be at least ${validation.minLength} characters`);
    }
    
    // Max length validation
    if (validation.maxLength && stringValue.length > validation.maxLength) {
      errors.push(`Must be less than ${validation.maxLength} characters`);
    }
    
    // Pattern validation
    if (validation.pattern && !validation.pattern.test(stringValue)) {
      errors.push('Invalid format');
    }
    
    // Custom validation rules
    if (validation.custom) {
      for (const rule of validation.custom) {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Create validation rule
   */
  createRule<T>(name: string, message: string, validate: (value: T) => boolean): ValidationRule<T> {
    return { name, message, validate };
  }
  
  /**
   * Common validation rules
   */
  readonly rules = {
    required: this.createRule('required', 'This field is required', (value) => !this.isEmpty(value)),
    email: this.createRule('email', 'Please enter a valid email', (value) => this.isValidEmail(String(value))),
    minLength: (min: number) => this.createRule('minLength', `Must be at least ${min} characters`, (value) => String(value).length >= min),
    maxLength: (max: number) => this.createRule('maxLength', `Must be less than ${max} characters`, (value) => String(value).length <= max),
    pattern: (pattern: RegExp, message: string) => this.createRule('pattern', message, (value) => pattern.test(String(value))),
    numeric: this.createRule('numeric', 'Must be a number', (value) => !isNaN(Number(value))),
    url: this.createRule('url', 'Please enter a valid URL', (value) => this.isValidUrl(String(value))),
  };
  
  /**
   * Check if value is empty
   */
  private isEmpty(value: unknown): boolean {
    return value === null || value === undefined || String(value).trim() === '';
  }
  
  /**
   * Check if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Check if username is valid
   */
  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  }
  
  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Check for inappropriate content (basic implementation)
   */
  private containsInappropriateContent(content: string): boolean {
    // This is a basic implementation - in production, you'd use a more sophisticated content filter
    const inappropriateWords = ['spam', 'scam', 'phishing'];
    const lowerContent = content.toLowerCase();
    
    return inappropriateWords.some(word => lowerContent.includes(word));
  }
}