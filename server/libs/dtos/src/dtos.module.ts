import { Module } from '@nestjs/common';

/**
 * DTOs Module
 *
 * Provides shared Data Transfer Objects (DTOs) and patterns
 * for consistent API interfaces across all microservices.
 *
 * This module includes:
 * - Common request/response DTOs
 * - Shared authentication DTOs
 * - Pagination and filtering DTOs
 * - Error response DTOs
 * - Base DTO classes and interfaces
 *
 * ## Usage
 *
 * Import this module in your service modules to access shared DTOs:
 *
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { DtosModule } from '@app/dtos';
 *
 * @Module({
 *   imports: [DtosModule],
 *   // ... other module configuration
 * })
 * export class YourServiceModule {}
 * ```
 *
 * Then import specific DTOs in your controllers and services:
 *
 * ```typescript
 * import { LoginDto, AuthResponseDto } from '@app/dtos';
 * ```
 */
@Module({})
export class DtosModule {}
