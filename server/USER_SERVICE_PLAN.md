# User Service Plan

## Overview
The User Service manages user profiles, relationships, settings, and search functionality.

## Technology Stack
- NestJS with Fastify
- PostgreSQL for user data
- Kafka for inter-service communication

## Development Tasks

### Phase 1: Basic Setup
- [x] Initialize service with NestJS CLI
- [x] Configure Fastify adapter
- [ ] Set up database connection
- [ ] Create user entity and repository

### Phase 2: Core Features
- [ ] Implement user profile management
- [ ] Create user relationships (friends/contacts)
- [ ] Develop user settings functionality
- [ ] Add user search capability
- [ ] Implement basic user preferences

### Phase 3: Advanced Features
- [ ] Add user blocking functionality
- [ ] Implement user activity tracking
- [ ] Create advanced search with filters
- [ ] Add user verification badges
- [ ] Implement user analytics

## Database Schema

### Users Table
- `id` (UUID): Primary key
- `authId` (UUID): Reference to Authentication service user
- `username` (String): Unique username
- `displayName` (String): User's display name
- `bio` (String): User biography
- `avatarUrl` (String): Profile picture URL
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Relationships Table
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to Users table (requester)
- `targetId` (UUID): Foreign key to Users table (target)
- `type` (Enum): Relationship type (friend, blocked, etc.)
- `status` (Enum): Status (pending, accepted, rejected)
- `createdAt` (DateTime): Relationship creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Settings Table
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to Users table
- `key` (String): Setting key
- `value` (JSON): Setting value
- `updatedAt` (DateTime): Last update timestamp

## API Endpoints

### User Profiles
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account

### User Relationships
- `GET /users/:id/relationships` - Get user relationships
- `POST /users/:id/relationships` - Create relationship request
- `PATCH /users/:id/relationships/:relationshipId` - Update relationship
- `DELETE /users/:id/relationships/:relationshipId` - Delete relationship

### User Settings
- `GET /users/:id/settings` - Get user settings
- `PATCH /users/:id/settings` - Update user settings

### User Search
- `GET /users/search` - Search for users

### Health Checks
- `GET /health` - Service health check endpoint
