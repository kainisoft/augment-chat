# Authentication Service Plan

## Overview
The Authentication Service handles user registration, login, and token management for the entire application.

## Technology Stack
- NestJS with Fastify
- PostgreSQL for user credentials
- JWT for token generation and validation
- Bcrypt for password hashing

## Development Tasks

### Phase 1: Basic Setup
- [x] Initialize service with NestJS CLI
- [x] Configure Fastify adapter
- [x] Set up database connection
- [x] Create user entity and repository

### Phase 2: Core Features
- [x] Implement user registration
- [x] Create login/logout functionality
- [x] Develop JWT token generation and validation
- [x] Add password reset capability
- [x] Implement basic security measures (rate limiting, etc.)

### Phase 3: Advanced Features
- [x] Add account lockout after failed attempts
- [x] Create session management
- [x] Implement comprehensive security logging
- [ ] Implement OAuth integration (Google, GitHub)
- [ ] Add two-factor authentication

### Phase 4: Service Standardization (Completed)
- [x] Migrate to shared infrastructure modules
- [x] Implement standardized folder structure
- [x] Add Kafka event communication
- [x] Integrate shared validation and DTOs
- [x] Apply security and testing standards

#### Phase 3 Detailed Implementation Plan

##### 1. Account Lockout After Failed Attempts
- [x] Update User entity and schema with `failedLoginAttempts` and `lockedUntil` fields
- [x] Create AccountLockoutService to manage account lockout logic
- [x] Update login flow to check for locked accounts
- [x] Implement failed login attempt tracking
- [x] Add automatic account unlocking after configurable time period

##### 2. Enhanced Session Management
- [x] Create endpoints to list active sessions for a user
- [x] Add endpoint to terminate specific sessions
- [x] Add endpoint to terminate all sessions except the current one
- [x] Implement session activity tracking (last activity time)
- [x] Add automatic session expiration based on inactivity
- [x] Store additional session metadata (device info, location, etc.)
- [x] Implement session history for security auditing

##### 3. Comprehensive Security Logging
- [x] Define comprehensive list of security events to log
- [x] Create structured log formats for security events
- [x] Add logging for all authentication events (login, logout, token refresh)
- [x] Log account lockout and unlock events
- [x] Log password changes and reset attempts
- [x] Log session creation, termination, and expiration
- [x] Create endpoints to retrieve security logs
- [x] Implement a simple dashboard for viewing security events

##### 4. OAuth Integration
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Implement OAuth authentication flow
- [ ] Create user account linking with OAuth providers
- [ ] Handle OAuth token refresh and validation
- [ ] Add profile data synchronization from OAuth providers

##### 5. Two-Factor Authentication
- [ ] Implement TOTP (Time-based One-Time Password) generation
- [ ] Create QR code generation for TOTP setup
- [ ] Add 2FA enrollment and verification endpoints
- [ ] Implement backup codes for account recovery
- [ ] Add option to enable/disable 2FA
- [ ] Create 2FA bypass for trusted devices

## Database Schema

### Users Table
- `id` (UUID): Primary key
- `email` (String): Unique email address
- `password` (String): Hashed password
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `lastLoginAt` (DateTime): Last successful login timestamp
- `isActive` (Boolean): Whether the account is active
- `isVerified` (Boolean): Whether the email has been verified
- `failedLoginAttempts` (Integer): Number of consecutive failed login attempts
- `lockedUntil` (DateTime): Timestamp until which the account is locked

### Redis Schema

#### Tokens
- Key pattern: `auth:token:{tokenId}`
- Value: JSON object containing token data
- TTL: Based on token expiry time

#### Sessions
- Key pattern: `auth:session:{sessionId}`
- Value: JSON object containing session data
  - `userId`: User ID
  - `email`: User email
  - `isVerified`: Whether the user is verified
  - `ip`: IP address used for login
  - `userAgent`: User agent used for login
  - `createdAt`: Session creation timestamp
  - `lastActivityAt`: Last activity timestamp
  - `deviceInfo`: Device information (optional)
  - `location`: Geographic location (optional)
- TTL: Configurable session timeout

#### Security Logs
- Key pattern: `auth:security:logs:{userId}:{timestamp}`
- Value: JSON object containing log data
  - `event`: Event type (login, logout, etc.)
  - `timestamp`: Event timestamp
  - `ip`: IP address
  - `userAgent`: User agent
  - `metadata`: Additional event-specific metadata
- TTL: Configurable log retention period

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user and issue tokens
- `POST /auth/logout` - Invalidate user tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Complete password reset

### Session Management (Phase 3)
- `GET /auth/sessions` - List all active sessions for the current user
- `DELETE /auth/sessions/:id` - Terminate a specific session
- `DELETE /auth/sessions` - Terminate all sessions except the current one
- `GET /auth/sessions/history` - View session history

### OAuth (Phase 3)
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle Google OAuth callback
- `GET /auth/github` - Initiate GitHub OAuth flow
- `GET /auth/github/callback` - Handle GitHub OAuth callback

### Two-Factor Authentication (Phase 3)
- `POST /auth/2fa/enable` - Enable 2FA for the current user
- `POST /auth/2fa/verify` - Verify 2FA code
- `POST /auth/2fa/disable` - Disable 2FA for the current user
- `GET /auth/2fa/backup-codes` - Generate backup codes for account recovery

### Security Logging (Phase 3)
- `GET /auth/security/logs` - View security logs for the current user
- `GET /auth/security/dashboard` - View security dashboard

### Health Checks
- `GET /health` - Service health check endpoint

## Implementation Progress

### Completed
- Basic authentication flow (registration, login, logout)
- JWT token generation and validation
- Password reset functionality
- Rate limiting for login, registration, and password reset using @app/security
- Account lockout after failed login attempts
- Enhanced session management with activity tracking and metadata
- Comprehensive security logging with structured events
- Kafka integration for event-driven communication (see [AUTH_SERVICE_KAFKA_INTEGRATION.md](AUTH_SERVICE_KAFKA_INTEGRATION.md))
- Service standardization with shared infrastructure modules
- CQRS pattern implementation following 'gold standard' approach
- Standardized folder structure matching user-service patterns

### Shared Module Integration
The Auth Service has been fully migrated to use shared infrastructure modules:
- **@app/dtos**: All authentication DTOs use shared patterns
- **@app/validation**: Input validation uses shared decorators
- **@app/security**: Rate limiting and security utilities integrated
- **@app/testing**: All tests use shared mock factories and test builders
- **@app/domain**: Uses shared value objects (UserId, Email, Password, etc.)
- **@app/events**: Event communication uses standardized interfaces
- **@app/kafka**: Kafka integration follows standardized patterns
- **@app/redis**: Session and token management uses shared Redis utilities
- **@app/logging**: Comprehensive security logging with shared service
- **@app/bootstrap**: Service startup uses enhanced bootstrap patterns

### Upcoming
- OAuth integration (Google, GitHub)
- Two-factor authentication

## Next Steps
1. Integrate OAuth providers (Google, GitHub)
2. Implement two-factor authentication with TOTP
3. Add backup codes for account recovery
4. Implement trusted device management

## Related Documents

### Core Planning Documents
- [Server Plan](SERVER_PLAN.md) - Main server implementation plan
- [Service Standardization Plan](SERVICE_STANDARDIZATION_PLAN.md) - Standardization implementation
- [Service Standardization Progress](SERVICE_STANDARDIZATION_PROGRESS.md) - Progress tracking
- [Shared Infrastructure Modules](SHARED_INFRASTRUCTURE_MODULES.md) - Shared modules documentation

### Architecture and Implementation Guides
- [DDD Implementation Guide](DDD_IMPLEMENTATION_GUIDE.md) - Domain-Driven Design patterns
- [CQRS Implementation Plan](CQRS_IMPLEMENTATION_PLAN.md) - CQRS implementation details
- [Security Standards Guide](SECURITY_STANDARDS_GUIDE.md) - Security implementation patterns
- [Testing Standards Guide](TESTING_STANDARDS_GUIDE.md) - Testing patterns and utilities

### Service Integration
- [Auth Service Kafka Integration](AUTH_SERVICE_KAFKA_INTEGRATION.md) - Kafka event communication
- [User Service Plan](USER_SERVICE_PLAN.md) - User service integration
- [Auth Service Redis Integration](../redis/AUTH_SERVICE_REDIS_INTEGRATION.md) - Redis integration patterns

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-09-10
- **Last Updated**: 2024-01-15
- **Version**: 2.0.0
- **Change Log**:
  - 2.0.0: Updated to reflect completed standardization and shared module integration
  - 1.2.0: Added comprehensive security logging and session management
  - 1.1.0: Added account lockout and enhanced security features
  - 1.0.0: Initial version
