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
- [ ] Implement user registration
- [ ] Create login/logout functionality
- [ ] Develop JWT token generation and validation
- [ ] Add password reset capability
- [ ] Implement basic security measures (rate limiting, etc.)

### Phase 3: Advanced Features
- [ ] Add OAuth integration (Google, GitHub, etc.)
- [ ] Implement two-factor authentication
- [ ] Add account lockout after failed attempts
- [ ] Create session management
- [ ] Implement comprehensive security logging

## Database Schema

### Users Table
- `id` (UUID): Primary key
- `email` (String): Unique email address
- `password` (String): Hashed password
- `salt` (String): Password salt
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Tokens Table
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to Users table
- `token` (String): Refresh token value
- `expiresAt` (DateTime): Token expiration timestamp
- `createdAt` (DateTime): Token creation timestamp

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user and issue tokens
- `POST /auth/logout` - Invalidate user tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Complete password reset

### OAuth (Phase 3)
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/github` - Initiate GitHub OAuth flow

### Health Checks
- `GET /health` - Service health check endpoint
