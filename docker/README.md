# Docker Development Environment

This directory contains Docker configuration for local development of the Chat Application.

## Directory Structure

```
docker/
├── Dockerfiles/                # Service-specific Dockerfiles
│   ├── api-gateway.Dockerfile  # With HMR support
│   ├── auth-service.Dockerfile # With HMR support
│   ├── chat-service.Dockerfile # With HMR support
│   ├── notification-service.Dockerfile # With HMR support
│   └── user-service.Dockerfile # With HMR support
├── config/                     # Configuration files
│   └── redis/                  # Redis configuration
│       ├── redis-node-1.conf
│       ├── redis-node-2.conf
│       └── redis-node-3.conf
├── scripts/                    # Helper scripts
│   ├── dev.sh                  # General development script
│   └── hmr-dev.sh              # HMR development script
└── init-scripts/               # Initialization scripts
    ├── kafka/                  # Kafka initialization
    │   └── create-topics.sh
    ├── mongo/                  # MongoDB initialization
    │   ├── 00-create-users.js
    │   └── 01-create-databases.js
    └── postgres/               # PostgreSQL initialization
        └── 01-create-databases.sh
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git repository cloned to your local machine

### Running the Environment

#### Standard Docker Compose

1. Start all services:

```bash
docker-compose up
```

2. Start specific services:

```bash
docker-compose up postgres mongo kafka
```

3. Start services in detached mode:

```bash
docker-compose up -d
```

4. View logs for a specific service:

```bash
docker-compose logs -f api-gateway
```

5. Stop all services:

```bash
docker-compose down
```

6. Stop all services and remove volumes:

```bash
docker-compose down -v
```

#### Development Scripts

We provide several development scripts to make working with Docker easier:

1. **General Development Script** (dev.sh):

```bash
# Start all infrastructure services (PostgreSQL, MongoDB, Kafka, Redis)
./docker/scripts/dev.sh infra

# Start a specific service with its dependencies
./docker/scripts/dev.sh auth

# Start all services
./docker/scripts/dev.sh all

# View logs for a specific service
./docker/scripts/dev.sh logs auth-service

# Stop all services
./docker/scripts/dev.sh down

# Stop all services and remove volumes
./docker/scripts/dev.sh clean
```

2. **Database Migration Script** (db-migrate.sh):

```bash
# Run migrations for a specific service
./docker/scripts/db-migrate.sh up auth

# Rollback migrations for a specific service
./docker/scripts/db-migrate.sh down user

# Create a new migration for a specific service
./docker/scripts/db-migrate.sh create auth CreateUsersTable

# Check migration status for a specific service
./docker/scripts/db-migrate.sh status auth

# Run migrations for all services
./docker/scripts/db-migrate.sh up all
```

3. **Database Seeding Script** (db-seed.sh):

```bash
# Seed database for a specific service
./docker/scripts/db-seed.sh run auth

# Clear seeded data for a specific service
./docker/scripts/db-seed.sh clear user

# Seed databases for all services
./docker/scripts/db-seed.sh run all
```

#### Development with Hot Module Replacement (HMR)

For a faster development experience, our Docker setup includes Hot Module Replacement (HMR) support:

1. **HMR Development Script** (hmr-dev.sh):

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

2. **Using Docker Compose**:

```bash
# Start all services with HMR support
docker-compose up -d

# Start a specific service with HMR support
docker-compose up -d auth-service
```

Benefits of using HMR:
- **Faster Development Cycle**: Changes are applied almost instantly (typically under 1 second)
- **State Preservation**: Application state is maintained between updates
- **Improved Developer Experience**: No need to manually restart services
- **Efficient Resource Usage**: Only the changed modules are recompiled

For more detailed information about Docker performance enhancements, including HMR, see the [Docker Performance Guide](../docs/docker/DOCKER_PERFORMANCE_GUIDE.md).

## Service Endpoints

- API Gateway: http://localhost:4000
- Auth Service: http://localhost:4001
- User Service: http://localhost:4002
- Chat Service: http://localhost:4003
- Notification Service: http://localhost:4004

## Database Access

### PostgreSQL

- Host: localhost
- Port: 5432
- Username: postgres
- Password: postgres
- Databases: auth_db, user_db

Connect using a PostgreSQL client:

```bash
psql -h localhost -p 5432 -U postgres -d auth_db
```

### MongoDB

- Host: localhost
- Port: 27017
- Username: mongo
- Password: mongo
- Databases: chat_db, notification_db

Connect using a MongoDB client:

```bash
mongo mongodb://mongo:mongo@localhost:27017/chat_db
```

### Redis Cluster

- Nodes:
  - localhost:6379
  - localhost:6380
  - localhost:6381

Connect to a Redis node:

```bash
redis-cli -h localhost -p 6379
```

## Kafka

- Bootstrap Server: localhost:9092
- Topics:
  - auth-events
  - user-service
  - chat-events
  - notification-events

## Troubleshooting

### Common Issues

1. **Port conflicts**: If you have services already running on the same ports, you'll need to stop them or change the port mappings in docker-compose.yml.

2. **Database initialization**: If the database initialization scripts fail, you may need to remove the volumes and restart:

```bash
docker-compose down -v
docker-compose up
```

3. **Redis Cluster**: If the Redis Cluster fails to initialize, you can manually create it:

```bash
docker-compose exec redis-node-1 redis-cli --cluster create redis-node-1:6379 redis-node-2:6379 redis-node-3:6379 --cluster-yes
```
