# Chat Application Project Overview

## Project Description
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
- **Architecture**: Domain-Driven Design (DDD)
  - **Domain Layer**: Rich domain models with business logic
  - **Application Layer**: Use cases and application services
  - **Infrastructure Layer**: External systems integration
  - **Presentation Layer**: Controllers and resolvers
- **Design Patterns**:
  - **Repository Pattern**: For data access abstraction
  - **CQRS**: Command Query Responsibility Segregation for complex operations
  - **Event Sourcing**: For tracking state changes as events

### Databases
- **PostgreSQL**: For structured data (users, authentication, relationships)
  - **ORM**: Drizzle ORM for type-safe database access and schema management
- **MongoDB**: For chat messages and unstructured data
- **Redis Cluster**: For caching, session management, and real-time features
  - Custom implementation on EC2 instances in production
  - Accessed via private IP addresses for security

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
