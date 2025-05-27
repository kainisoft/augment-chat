/**
 * DTOs Library
 *
 * This module exports shared Data Transfer Objects (DTOs) and patterns
 * for consistent API interfaces across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 */

// Core module
export { DtosModule } from './dtos.module';

// Authentication DTOs (most frequently used - 8 usages)
export {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ValidateTokenDto,
} from './auth/auth-request.dto';

export {
  AuthResponseDto,
  TokenValidationResponseDto,
  LogoutResponseDto,
} from './auth/auth-response.dto';

// Common DTOs (frequently used)
export {
  PaginationQueryDto,
  PaginatedResponseDto,
  PaginationMetaDto,
} from './common/pagination.dto';

export {
  ErrorResponseDto,
  ValidationErrorResponseDto,
  AuthErrorResponseDto,
} from './common/error-response.dto';

export {
  ListResponseDto,
  SearchResponseDto,
  HistoryResponseDto,
  PaginationMetadata,
  createPaginationMetadata,
} from './common/list-response.dto';

// GraphQL DTOs (less frequently used)
export {
  GraphQLPaginationInput,
  GraphQLSearchPaginationInput,
  GraphQLCursorPaginationInput,
  GraphQLFilterPaginationInput,
} from './graphql/pagination-input.dto';

export {
  GraphQLPageInfo,
  GraphQLListResponse,
  GraphQLSearchResponse,
  GraphQLConnection,
  GraphQLEdge,
  createGraphQLConnection,
  createGraphQLListResponse,
  createGraphQLSearchResponse,
} from './graphql/pagination-response.dto';
