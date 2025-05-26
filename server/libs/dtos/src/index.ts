/**
 * DTOs Library
 *
 * This module exports shared Data Transfer Objects (DTOs) and patterns
 * for consistent API interfaces across all microservices.
 */

export * from './dtos.module';

// Authentication DTOs
export * from './auth/auth-request.dto';
export * from './auth/auth-response.dto';

// Common DTOs
export * from './common/pagination.dto';
export * from './common/error-response.dto';
