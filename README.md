# Chat Application

A modern chat application with microservice architecture built with NestJS, MongoDB, PostgreSQL, Kafka, and Redis.

## Project Structure

- **server/** - Backend NestJS monorepo with microservices
- **client/** - Frontend applications (web, mobile)
- **docker/** - Docker configuration files
- **docs/** - Project documentation and implementation plans

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 4000 | GraphQL API Gateway for client applications |
| Auth Service | 4001 | Handles authentication and authorization |
| User Service | 4002 | Manages user profiles and relationships |
| Chat Service | 4003 | Handles chat messages and conversations |
| Notification Service | 4004 | Manages notifications |

## Infrastructure

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Relational database for user and auth data |
| MongoDB | 27017 | Document database for chat and notification data |
| Kafka | 9092 | Message broker for inter-service communication |
| Redis Cluster | 6379-6381 | Caching and session management |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- pnpm

### Setup

1. Clone the repository
2. Run the infrastructure services:

```bash
docker compose up -d postgres mongo kafka redis-node-1 redis-node-2 redis-node-3 redis-cluster-init
```

3. Start the microservices:

```bash
# Start all microservices
cd server && pnpm run start:dev

# Or start individual services
cd server && pnpm run start:dev api-gateway
cd server && pnpm run start:dev auth-service
cd server && pnpm run start:dev user-service
cd server && pnpm run start:dev chat-service
cd server && pnpm run start:dev notification-service
```

### Health Checks

Each microservice exposes health check endpoints:

- `/health` - Full health status
- `/health/liveness` - Simple liveness check
- `/health/readiness` - Readiness check with component status

Example:
```bash
curl http://localhost:4002/health
```

## Development

### Development with Hot Module Replacement (HMR)

This project uses NestJS's built-in Hot Module Replacement for a faster development experience. HMR allows code changes to be applied without restarting the entire application, preserving application state and significantly reducing reload times.

#### Using the HMR Development Script

We provide a specialized script for working with HMR:

```bash
# Build a service with HMR support
./docker/scripts/hmr-dev.sh build auth-service

# Run a service with HMR support
./docker/scripts/hmr-dev.sh run auth-service

# View logs for a running service
./docker/scripts/hmr-dev.sh logs auth-service

# Stop a running service
./docker/scripts/hmr-dev.sh stop auth-service
```

#### Using Docker Compose with HMR

Alternatively, you can use Docker Compose directly:

```bash
# Start all services with HMR support
docker-compose up -d

# Start a specific service with HMR support
docker-compose up -d auth-service
```

#### Benefits of HMR

- **Faster Development Cycle**: Changes are applied almost instantly (typically under 1 second)
- **State Preservation**: Application state is maintained between updates
- **Improved Developer Experience**: No need to manually restart services
- **Efficient Resource Usage**: Only the changed modules are recompiled

For more detailed information about Docker performance enhancements, including HMR, see the [Docker Performance Guide](docs/docker/DOCKER_PERFORMANCE_GUIDE.md).

### Adding New Features

1. Create a feature branch
2. Implement the feature
3. Write tests
4. Submit a pull request

### Project Structure

The project follows a monorepo structure with NestJS Workspaces:

```
server/
├── apps/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── chat-service/
│   └── notification-service/
└── libs/
    └── common/
```

## Deployment

The application is designed to be deployed on AWS using:

- ECS for microservices
- RDS for PostgreSQL
- DocumentDB for MongoDB
- MSK for Kafka
- EC2 instances for Redis Cluster

## Current Initiatives

### Service Standardization

We are currently working on standardizing the architecture and patterns across our microservices. This initiative aims to create a more consistent, maintainable, and scalable codebase.

**Progress:**
- ✅ Phase 1: Extract common domain models (7.5% complete)
- ⏳ Phase 2-9: Pending

For detailed progress information, see:
- [Service Standardization Plan](docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Service Standardization Progress](docs/server/SERVICE_STANDARDIZATION_PROGRESS.md)

## Documentation

All project documentation is organized in the `docs/` directory:

- [Project Overview and Plans](docs/project/) - High-level project information
- [Server Implementation](docs/server/) - Server-side implementation details
- [Client Implementation](docs/client/) - Client-side implementation details
- [Infrastructure Setup](docs/infrastructure/) - Infrastructure configuration
- [Database Design](docs/database/) - Database schemas and ORM setup
- [Docker Configuration](docs/docker/) - Docker setup and optimization
- [Deployment Plans](docs/deployment/) - AWS deployment instructions
- [Testing Strategy](docs/testing/) - Testing approach and reports
- [Logging System](docs/logging/) - Centralized logging architecture

### Documentation Standards

To ensure consistency, all documentation follows a standardized format:

- [Documentation Standard](docs/DOCUMENTATION_STANDARD.md) - Guidelines for document formatting
- [Document Templates](docs/TEMPLATE.md) - Templates for creating new documentation

When contributing to the project, please follow these documentation standards to maintain consistency and clarity.

See the [Documentation Index](docs/README.md) for a complete list of available documentation.
