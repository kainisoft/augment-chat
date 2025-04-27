# Server Development Plan

## Development Phases

### Phase 1: Server Project Setup and Infrastructure
- [x] 1. Initialize NestJS monorepo using Workspaces with Fastify
  - Use `pnpm` for package management
  - Use NestJS CLI commands for project generation
  - Configure for strict package versioning
- [x] 2. Set up Docker configuration for local development
- [x] 3. Configure Kafka for local development
- [x] 4. Set up PostgreSQL and MongoDB with Docker Compose

### Phase 2: Core Server Services
- [ ] 1. Create shared libraries for common code
  - Use `nest generate library` for creating shared libraries
- [ ] 2. Implement Kafka communication layer
  - Use `pnpm add` for adding Kafka packages
- [ ] 3. Develop Authentication Service (NestJS + PostgreSQL)
  - Use `nest generate app` and related commands
- [ ] 4. Develop User Service (NestJS + PostgreSQL)
  - Use `nest generate app` and related commands
- [ ] 5. Develop Chat Service (NestJS + MongoDB)
  - Use `nest generate app` and related commands
- [ ] 6. Implement GraphQL API Gateway with Fastify
  - Use `nest generate app` and related commands

### Phase 3: Backend Advanced Features
- [ ] 1. Enhance Chat Service with additional features (read receipts, typing indicators)
- [ ] 2. Implement Notification Service
- [ ] 3. Add file sharing functionality
- [ ] 4. Implement user presence indicators
- [ ] 5. Add group chat capabilities

## Microservices Breakdown

### API Gateway (Port 4000)
- [ ] GraphQL schema stitching/federation
- [ ] Authentication middleware
- [ ] Request routing
- [ ] Rate limiting

### Authentication Service (Port 4001)
- [ ] User registration
- [ ] Login/logout
- [ ] JWT token management
- [ ] Password reset
- [ ] OAuth integration (optional)

### User Service (Port 4002)
- [ ] User profiles
- [ ] User relationships (friends/contacts)
- [ ] User settings
- [ ] User search

### Chat Service (Port 4003)
- [ ] Private messaging
- [ ] Group chats
- [ ] Message history
- [ ] Read receipts
- [ ] Typing indicators
- [ ] File attachments

### Notification Service (Port 4004)
- [ ] Real-time notifications
- [ ] Email notifications (optional)
- [ ] Push notifications (optional)

## Database Schema (High-Level)

### PostgreSQL
- [x] Users table
- [x] Authentication table (refresh_tokens)
- [x] Relationships table
- [x] User settings table

### MongoDB
- [x] Chat messages collection
- [x] Group chats collection (conversations)
- [x] Attachments metadata collection
