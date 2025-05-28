/**
 * DTOs Library
 *
 * This module exports shared Data Transfer Objects (DTOs) and patterns
 * for consistent API interfaces across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 * Only exports that are actually used across services are included.
 */

// Authentication DTOs (actually used across services)
export {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth/auth-request.dto';

export { AuthResponseDto } from './auth/auth-response.dto';

// Common DTOs (used by multiple services)
export {
  PaginationQueryDto,
  PaginatedResponseDto,
  PaginationMetaDto,
} from './common/pagination.dto';

export {
  ListResponseDto,
  SearchResponseDto,
  HistoryResponseDto,
  PaginationMetadata,
  createPaginationMetadata,
} from './common/list-response.dto';

// GraphQL DTOs (used by user-service)
export { GraphQLSearchPaginationInput } from './graphql/pagination-input.dto';

export {
  GraphQLListResponse,
  GraphQLSearchResponse,
} from './graphql/pagination-response.dto';

// Lazy-loaded exports for optional features (tree-shakable in production)
export const LazyDtoUtils = {
  // Core module (lazy-loaded to reduce bundle size)
  async loadDtosModule() {
    const { DtosModule } = await import('./dtos.module');
    return DtosModule;
  },

  // Unused DTOs (available via lazy loading)
  async loadUnusedDtos() {
    const { ValidateTokenDto } = await import('./auth/auth-request.dto');

    const { TokenValidationResponseDto, LogoutResponseDto } = await import(
      './auth/auth-response.dto'
    );

    const {
      ErrorResponseDto,
      ValidationErrorResponseDto,
      AuthErrorResponseDto,
    } = await import('./common/error-response.dto');

    return {
      ValidateTokenDto,
      TokenValidationResponseDto,
      LogoutResponseDto,
      ErrorResponseDto,
      ValidationErrorResponseDto,
      AuthErrorResponseDto,
    };
  },

  // GraphQL utilities (available via lazy loading)
  async loadGraphQLUtils() {
    const {
      GraphQLPageInfo,
      createGraphQLConnection,
      createGraphQLListResponse,
      createGraphQLSearchResponse,
    } = await import('./graphql/pagination-response.dto');

    // Note: GraphQLConnection and GraphQLEdge are interfaces and must be imported directly
    return {
      GraphQLPageInfo,
      createGraphQLConnection,
      createGraphQLListResponse,
      createGraphQLSearchResponse,
    };
  },
};
