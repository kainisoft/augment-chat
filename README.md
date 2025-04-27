# Chat Application

A modern chat application with microservice architecture built with NestJS, MongoDB, PostgreSQL, Kafka, and Redis.

## Project Structure

- **server/** - Backend NestJS monorepo with microservices
- **client/** - Frontend applications (web, mobile)
- **docker/** - Docker configuration files

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
