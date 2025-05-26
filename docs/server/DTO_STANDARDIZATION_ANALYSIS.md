# DTO Standardization Analysis

## Overview

This document analyzes the current DTO implementations across all services to identify opportunities for standardization using shared DTOs from `@app/dtos`. The analysis covers pagination patterns, error responses, and other common DTO patterns that can be unified.

## Current Shared DTOs Available

### @app/dtos Module
- `PaginationQueryDto` - Standard pagination input
- `PaginationResponseDto` - Standard pagination response
- `ErrorResponseDto` - Standard error response format
- `AuthResponseDto` - Authentication response
- `RegisterDto`, `LoginDto`, etc. - Auth-related DTOs

## Analysis Results

### 1. Pagination Patterns Found

#### User Service - GraphQL Types
**File**: `server/apps/user-service/src/graphql/types/user-input.types.ts`

**Current Implementation**:
```typescript
@InputType({ description: 'Input for searching users' })
export class SearchUsersInput {
  @Field(() => String, { description: 'Search term' })
  searchTerm: string;

  @Field(() => Number, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  offset?: number;
}
```

**Standardization Opportunity**: ✅ HIGH PRIORITY
- Can extend shared `PaginationQueryDto` for limit/offset
- Need GraphQL-specific pagination input type
- Should maintain GraphQL decorators while using shared validation

**File**: `server/apps/user-service/src/graphql/types/user.types.ts`

**Current Implementation**:
```typescript
@ObjectType()
export class UserConnection {
  @Field(() => [UserType])
  nodes: UserType[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@ObjectType()
export class UserSearchResult {
  @Field(() => [UserType])
  users: UserType[];

  @Field(() => Int)
  totalCount: number;
}
```

**Standardization Opportunity**: ✅ HIGH PRIORITY
- Can create GraphQL-specific pagination response types
- Should extend shared pagination patterns
- Need to maintain GraphQL schema compatibility

#### Logging Service - Query DTOs
**File**: `server/apps/logging-service/src/api/dto/log-query.dto.ts`

**Current Implementation**:
```typescript
export class LogQueryDto {
  // ... other fields
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class LogQueryResponseDto {
  logs: Record<string, any>[];
  total: number;
  limit: number;
  offset: number;
}
```

**Standardization Opportunity**: ✅ MEDIUM PRIORITY
- Can extend shared `PaginationQueryDto` for limit/offset validation
- Response can use shared `PaginationResponseDto` pattern
- Maintains REST API compatibility

#### Auth Service - Session DTOs
**File**: `server/apps/auth-service/src/presentation/dtos/session/session-history.dto.ts`

**Current Implementation**:
```typescript
export class SessionHistoryDto {
  sessions: SessionHistoryEntryDto[];
  totalCount: number;
}
```

**File**: `server/apps/auth-service/src/presentation/dtos/session/session-list.dto.ts`

**Current Implementation**:
```typescript
export class SessionListDto {
  sessions: SessionInfoDto[];
  totalCount: number;
}
```

**Standardization Opportunity**: ✅ MEDIUM PRIORITY
- Can use shared pagination response pattern
- Simple list responses that can benefit from standardization
- Should maintain API contract compatibility

### 2. Error Response Patterns

#### Current Status
- Most services already use shared `ErrorResponseDto` from `@app/dtos`
- Exception filters properly configured to use shared error format
- No custom error response DTOs found that need migration

**Standardization Status**: ✅ ALREADY STANDARDIZED

### 3. Service-Specific DTOs Analysis

#### Auth Service Session DTOs
**Files**:
- `session-info.dto.ts`
- `session-history.dto.ts`
- `terminate-session.dto.ts`

**Analysis**: ❌ SHOULD REMAIN CUSTOM
- Domain-specific session management DTOs
- Contain auth-service specific fields and validation
- No equivalent patterns in other services
- Provide value-specific business logic

#### User Service GraphQL Types
**Files**:
- `user-input.types.ts` (CreateUserInput, UpdateUserProfileInput, etc.)
- `user.types.ts` (UserType)
- `relationship-input.types.ts`
- `relationship.types.ts`

**Analysis**: ❌ SHOULD REMAIN CUSTOM (mostly)
- GraphQL-specific decorators and schema requirements
- Domain-specific user management operations
- Pagination patterns can be standardized, but core types should remain
- Relationship management is user-service specific

#### Logging Service DTOs
**Files**:
- `log-level.dto.ts`
- `log-query.dto.ts`

**Analysis**: 🔄 PARTIAL STANDARDIZATION
- Log-level and query-specific fields should remain custom
- Pagination aspects can use shared patterns
- Service-specific logging requirements

## Standardization Plan

### Phase 1: Create GraphQL Pagination Extensions (Week 1, Day 1-2)

**Objective**: Create GraphQL-compatible pagination DTOs that extend shared patterns.

**Tasks**:
1. Create `GraphQLPaginationInput` that extends `PaginationQueryDto`
2. Create `GraphQLPaginationResponse` that extends `PaginationResponseDto`
3. Add GraphQL decorators while maintaining shared validation logic

**Files to Create**:
- `server/libs/dtos/src/graphql/pagination-input.dto.ts`
- `server/libs/dtos/src/graphql/pagination-response.dto.ts`

### Phase 2: Migrate User Service Pagination (Week 1, Day 3)

**Objective**: Update user-service to use standardized GraphQL pagination.

**Tasks**:
1. Update `SearchUsersInput` to extend `GraphQLPaginationInput`
2. Update `UserConnection` and `UserSearchResult` to use standardized response
3. Update resolvers to use new pagination DTOs
4. Test GraphQL schema compatibility

**Files to Update**:
- `server/apps/user-service/src/graphql/types/user-input.types.ts`
- `server/apps/user-service/src/graphql/types/user.types.ts`
- Related resolver files

### Phase 3: Migrate Logging Service Pagination (Week 1, Day 4)

**Objective**: Update logging-service to use shared pagination patterns.

**Tasks**:
1. Update `LogQueryDto` to extend `PaginationQueryDto`
2. Update `LogQueryResponseDto` to use `PaginationResponseDto` pattern
3. Test API compatibility
4. Update API documentation

**Files to Update**:
- `server/apps/logging-service/src/api/dto/log-query.dto.ts`

### Phase 4: Migrate Auth Service Session Lists (Week 1, Day 5)

**Objective**: Update auth-service session DTOs to use shared list patterns.

**Tasks**:
1. Create shared `ListResponseDto` pattern if needed
2. Update `SessionHistoryDto` and `SessionListDto` to use shared patterns
3. Test API compatibility
4. Update Swagger documentation

**Files to Update**:
- `server/apps/auth-service/src/presentation/dtos/session/session-history.dto.ts`
- `server/apps/auth-service/src/presentation/dtos/session/session-list.dto.ts`

## Implementation Guidelines

### 1. Backward Compatibility
- All API contracts must remain unchanged
- GraphQL schema must maintain compatibility
- Swagger documentation must reflect accurate types

### 2. Validation Consistency
- Use shared validation decorators from `@app/validation`
- Maintain consistent error messages across services
- Preserve service-specific validation requirements

### 3. Type Safety
- Maintain full TypeScript type safety
- Use proper generic types for reusable patterns
- Ensure GraphQL type generation works correctly

### 4. Testing Requirements
- Test all API endpoints for regressions
- Verify GraphQL schema generation
- Test pagination functionality across services
- Validate error response formats

## Success Criteria

### Technical Criteria
- ✅ All pagination patterns use shared base DTOs
- ✅ GraphQL schema remains compatible
- ✅ REST API contracts unchanged
- ✅ No duplicate pagination logic between services
- ✅ Consistent validation across all pagination DTOs

### Quality Criteria
- ✅ Reduced code duplication
- ✅ Improved maintainability
- ✅ Consistent developer experience
- ✅ Preserved service-specific requirements

## Files That Should Remain Custom

### Auth Service
- `SessionInfoDto` - Auth-specific session data with device info, location, and security metadata
- `SessionHistoryEntryDto` - Auth-specific session history with termination reasons and security context
- `TerminateSessionDto` - Auth-specific session termination operations
- `TokenPayload` - JWT-specific payload structure for auth service
- **Rationale**: These DTOs contain domain-specific authentication and session management data that is unique to the auth service and cannot be generalized across other services.

### User Service
- `CreateUserInput` - User-specific creation logic with auth service integration
- `UpdateUserProfileInput` - User-specific profile fields (bio, avatar, display name)
- `UpdateUserStatusInput` - User status management specific to user domain
- `UserType` - Core user domain object with GraphQL decorators
- `RelationshipInput` types - User-specific relationship operations (add friend, block, etc.)
- `RelationshipType` - User relationship domain objects
- **Rationale**: These DTOs represent core user domain concepts and GraphQL-specific implementations that are central to the user service's business logic.

### Logging Service
- `LogLevelDto` - Logging-specific enums and validation rules
- Core log query fields (service, level, timestamps, query text) - Domain-specific logging filters
- **Rationale**: While pagination was standardized, the core logging query parameters are specific to log management and cannot be generalized.

### All Services
- **Health Check DTOs** - Service-specific health indicators and status reporting
- **Service-specific Error Extensions** - Domain-specific error details beyond the shared error format
- **Domain Value Objects** - Service-specific value objects that represent business concepts

## Estimated Impact

### Code Reduction
- **Pagination Logic**: ~40% reduction in duplicate pagination code
- **Validation Logic**: ~30% reduction in duplicate validation patterns
- **Response Formatting**: ~50% reduction in duplicate response structures

### Maintenance Benefits
- **Centralized Updates**: Pagination changes only need to be made in shared DTOs
- **Consistent Behavior**: All services will have identical pagination behavior
- **Type Safety**: Shared types ensure consistency across service boundaries
