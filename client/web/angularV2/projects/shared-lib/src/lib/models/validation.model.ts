/**
 * Validation models
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationRule<T = unknown> {
  name: string;
  message: string;
  validate: (value: T) => boolean;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: ValidationRule[];
}

export interface FormValidation {
  [fieldName: string]: FieldValidation;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationContext {
  field: string;
  value: unknown;
  form?: Record<string, unknown>;
  rules: ValidationRule[];
}