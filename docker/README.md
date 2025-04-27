# Docker Development Environment

This directory contains Docker configuration for local development of the Chat Application.

## Directory Structure

```
docker/
├── Dockerfiles/                # Service-specific Dockerfiles
│   ├── api-gateway.Dockerfile
│   ├── auth-service.Dockerfile
│   ├── chat-service.Dockerfile
│   ├── notification-service.Dockerfile
│   └── user-service.Dockerfile
├── config/                     # Configuration files
│   └── redis/                  # Redis configuration
│       ├── redis-node-1.conf
│       ├── redis-node-2.conf
│       └── redis-node-3.conf
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

## Service Endpoints

- API Gateway: http://localhost:3001
- Auth Service: http://localhost:3002
- User Service: http://localhost:3000
- Chat Service: http://localhost:3003
- Notification Service: http://localhost:3004

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
