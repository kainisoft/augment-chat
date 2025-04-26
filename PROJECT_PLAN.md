# Chat Application Project Plan

## Project Overview
A real-time chat application with microservice architecture, deployed on AWS.

## Development Guidelines
- Use pnpm as the package manager
- Use strict package versions only
- Leverage NestJS CLI commands (`nest new`, `nest generate`, etc.) instead of creating files manually
- Use `pnpm add` to add new packages instead of manually editing package.json

## Technology Stack

### Client
- **Web**:
  - **Framework**: Next.js
  - **API Communication**: GraphQL with Apollo Client
  - **Styling**: Tailwind CSS
  - **Real-time**: WebSockets for live updates
- **Mobile** (future):
  - To be determined

### Server
- **Framework**: NestJS with native Workspaces for monorepo
- **HTTP Engine**: Fastify (instead of Express.js)
- **API**: GraphQL for client communication
- **Inter-service Communication**: Kafka
- **Authentication**: JWT

### Databases
- **PostgreSQL**: For structured data (users, authentication, relationships)
- **MongoDB**: For chat messages and unstructured data
- **Redis**: For caching and session management (optional)

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: AWS ECS or EKS
- **Databases**: AWS RDS (PostgreSQL), DocumentDB/Atlas (MongoDB)
- **Message Broker**: AWS MSK (managed Kafka)
- **Storage**: AWS S3 for file attachments
- **CI/CD**: GitHub Actions or AWS CodePipeline

## Project Structure

```
├── server/                   # NestJS monorepo using Workspaces
│   ├── apps/
│   │   ├── api-gateway/      # GraphQL API Gateway
│   │   ├── auth-service/     # Authentication microservice
│   │   ├── user-service/     # User management microservice
│   │   ├── chat-service/     # Chat functionality microservice
│   │   └── notification-service/ # Notifications microservice
│   ├── libs/                 # Shared libraries
│   │   ├── common/           # Common utilities, DTOs, etc.
│   │   ├── database/         # Database configurations and models
│   │   └── kafka/            # Kafka producers/consumers
│   └── nest-cli.json         # NestJS monorepo configuration
├── client/                   # Client applications
│   ├── web/                  # Next.js web application
│   │   ├── components/       # React components
│   │   ├── pages/            # Next.js pages
│   │   ├── public/           # Static assets
│   │   └── styles/           # CSS/Tailwind styles
│   └── mobile/               # Future mobile application
└── docker/                   # Docker configuration
    ├── docker-compose.yml    # Local development environment
    └── Dockerfiles/          # Service-specific Dockerfiles
```

## Implementation Phases

## Server Development Phases

### Phase 1: Server Project Setup and Infrastructure
- [x] 1. Initialize NestJS monorepo using Workspaces with Fastify
  - Use `pnpm` for package management
  - Use NestJS CLI commands for project generation
  - Configure for strict package versioning
- [ ] 2. Set up Docker configuration for local development
- [ ] 3. Configure Kafka for local development
- [ ] 4. Set up PostgreSQL and MongoDB with Docker Compose

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

## Client Web Development Phases

### Phase 1: Frontend Project Setup
- [ ] 1. Initialize Next.js web client project
  - Use `pnpm` for package management
- [ ] 2. Set up Next.js with Apollo Client
- [ ] 3. Configure project structure and styling with Tailwind CSS

### Phase 2: Core Frontend Features
- [ ] 1. Implement authentication UI (login/register)
- [ ] 2. Create user profile management
- [ ] 3. Develop chat interface
- [ ] 4. Implement real-time updates with WebSockets

### Phase 3: Frontend Advanced Features
- [ ] 1. Implement file sharing UI
- [ ] 2. Add notifications interface
- [ ] 3. Create group chat UI
- [ ] 4. Implement user presence indicators
- [ ] 5. Add mobile responsiveness

## Deployment Phase

### Phase 1: Deployment and Optimization
- [ ] 1. Create AWS infrastructure with IaC (Terraform or AWS CDK)
- [ ] 2. Set up CI/CD pipeline
- [ ] 3. Deploy to AWS
- [ ] 4. Implement monitoring and logging
- [ ] 5. Performance optimization
- [ ] 6. Security hardening

## Microservices Breakdown

### API Gateway
- [ ] GraphQL schema stitching/federation
- [ ] Authentication middleware
- [ ] Request routing
- [ ] Rate limiting

### Authentication Service
- [ ] User registration
- [ ] Login/logout
- [ ] JWT token management
- [ ] Password reset
- [ ] OAuth integration (optional)

### User Service
- [ ] User profiles
- [ ] User relationships (friends/contacts)
- [ ] User settings
- [ ] User search

### Chat Service
- [ ] Private messaging
- [ ] Group chats
- [ ] Message history
- [ ] Read receipts
- [ ] Typing indicators
- [ ] File attachments

### Notification Service
- [ ] Real-time notifications
- [ ] Email notifications (optional)
- [ ] Push notifications (optional)

## Database Schema (High-Level)

### PostgreSQL
- [ ] Users table
- [ ] Authentication table
- [ ] Relationships table
- [ ] User settings table

### MongoDB
- [ ] Chat messages collection
- [ ] Group chats collection
- [ ] Attachments metadata collection
