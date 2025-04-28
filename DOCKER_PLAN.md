# Docker Development Environment Plan

## Overview
This document outlines the Docker configuration for local development, including service containers, networking, and volume management.

## Docker Compose Structure

```yaml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build:
      context: ./server
      dockerfile: ./docker/Dockerfiles/api-gateway.Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - auth-service
      - user-service
      - chat-service
      - notification-service
    networks:
      - chat-network

  # Auth Service
  auth-service:
    build:
      context: ./server
      dockerfile: ./docker/Dockerfiles/auth-service.Dockerfile
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - PORT=3002
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_db
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - postgres
      - kafka
    networks:
      - chat-network

  # User Service
  user-service:
    build:
      context: ./server
      dockerfile: ./docker/Dockerfiles/user-service.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/user_db
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - postgres
      - kafka
    networks:
      - chat-network

  # Chat Service
  chat-service:
    build:
      context: ./server
      dockerfile: ./docker/Dockerfiles/chat-service.Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - PORT=3003
      - MONGODB_URI=mongodb://mongo:27017/chat_db
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - mongo
      - kafka
    networks:
      - chat-network

  # Notification Service
  notification-service:
    build:
      context: ./server
      dockerfile: ./docker/Dockerfiles/notification-service.Dockerfile
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - PORT=3004
      - MONGODB_URI=mongodb://mongo:27017/notification_db
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - mongo
      - kafka
    networks:
      - chat-network

  # Web Client
  web-client:
    build:
      context: ./client/web
      dockerfile: ../../docker/Dockerfiles/web-client.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001/graphql
    volumes:
      - ./client/web:/app
      - /app/node_modules
    networks:
      - chat-network

  # PostgreSQL
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_MULTIPLE_DATABASES=auth_db,user_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/init-scripts/postgres:/docker-entrypoint-initdb.d
    networks:
      - chat-network

  # MongoDB
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=mongo
      - MONGO_INITDB_ROOT_PASSWORD=mongo
    volumes:
      - mongo-data:/data/db
      - ./docker/init-scripts/mongo:/docker-entrypoint-initdb.d
    networks:
      - chat-network

  # Kafka
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.0
    ports:
      - "2181:2181"
    environment:
      - ZOOKEEPER_CLIENT_PORT=2181
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
    networks:
      - chat-network

  kafka:
    image: confluentinc/cp-kafka:7.0.0
    ports:
      - "9092:9092"
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      - KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    volumes:
      - kafka-data:/var/lib/kafka/data
    depends_on:
      - zookeeper
    networks:
      - chat-network

  # Redis Cluster (Simulating production setup)
  redis-node-1:
    image: redis:6-alpine
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "6379:6379"
      - "16379:16379"
    volumes:
      - ./docker/config/redis/redis-node-1.conf:/usr/local/etc/redis/redis.conf
      - redis-node-1-data:/data
    networks:
      - chat-network

  redis-node-2:
    image: redis:6-alpine
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "6380:6379"
      - "16380:16379"
    volumes:
      - ./docker/config/redis/redis-node-2.conf:/usr/local/etc/redis/redis.conf
      - redis-node-2-data:/data
    networks:
      - chat-network

  redis-node-3:
    image: redis:6-alpine
    command: redis-server /usr/local/etc/redis/redis.conf
    ports:
      - "6381:6379"
      - "16381:16379"
    volumes:
      - ./docker/config/redis/redis-node-3.conf:/usr/local/etc/redis/redis.conf
      - redis-node-3-data:/data
    networks:
      - chat-network

  redis-cluster-init:
    image: redis:6-alpine
    depends_on:
      - redis-node-1
      - redis-node-2
      - redis-node-3
    command: >
      sh -c "sleep 5 &&
             redis-cli --cluster create redis-node-1:6379 redis-node-2:6379 redis-node-3:6379 --cluster-yes"
    networks:
      - chat-network

networks:
  chat-network:
    driver: bridge

volumes:
  postgres-data:
  mongo-data:
  kafka-data:
  zookeeper-data:
  redis-node-1-data:
  redis-node-2-data:
  redis-node-3-data:
```

## Dockerfile Templates

### Base Dockerfile for NestJS Services
```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies
RUN pnpm install --prod

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/nest-cli.json ./

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/apps/SERVICE_NAME/main"]
```

### Web Client Dockerfile
```dockerfile
FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies
RUN pnpm install --prod

# Copy built application
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.js ./

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"]
```

## Development Tasks

### Docker Setup
- [x] Create docker-compose.yml file
- [x] Create service-specific Dockerfiles
  - [x] api-gateway.Dockerfile
  - [x] auth-service.Dockerfile
  - [x] user-service.Dockerfile
  - [x] chat-service.Dockerfile
  - [x] notification-service.Dockerfile
  - [ ] web-client.Dockerfile (pending client implementation)
- [x] Configure network settings for inter-service communication
- [x] Set up volume mappings for persistent data

### Database Setup
- [x] Create initialization scripts for PostgreSQL
  - [x] Create multiple databases
  - [x] Set up initial schema
- [x] Create initialization scripts for MongoDB
  - [x] Create databases
  - [x] Set up users and permissions
- [x] Configure Redis Cluster
  - [x] Create Redis configuration files for each node
  - [x] Set up cluster initialization script
  - [x] Configure persistence settings
  - [ ] Set up connection pooling in services (will be implemented with Redis client)

### Kafka Setup
- [x] Create topic initialization script
  - [x] auth-events
  - [x] user-events
  - [x] chat-events
  - [x] notification-events
- [ ] Configure Kafka Connect (optional)

### Development Workflow
- [ ] Create development scripts
  - [ ] `docker-compose up` for starting all services
  - [ ] `docker-compose up <service>` for starting specific services
  - [ ] Scripts for database migrations
  - [ ] Scripts for seeding test data
- [ ] Configure hot-reloading for development
- [ ] Set up logging aggregation

## Docker Optimization for Local Development
- [ ] Implement BuildKit for faster builds
  - [ ] Enable BuildKit in Docker configuration
  - [ ] Update Dockerfiles to leverage BuildKit features
- [ ] Optimize dependency management
  - [ ] Use pnpm's frozen lockfile mode (`--frozen-lockfile`)
  - [ ] Implement dependency caching strategy
  - [ ] Configure selective package installation for microservices
- [ ] Improve volume performance
  - [ ] Implement named volumes for node_modules
  - [ ] Configure selective bind mounts for source code
  - [ ] Optimize Docker volume configuration
- [ ] Enhance service startup
  - [ ] Implement conditional service dependencies
  - [ ] Create service profiles for different development scenarios
  - [ ] Optimize nodemon configuration for faster reloading
- [ ] Resource optimization
  - [ ] Configure appropriate resource limits for development
  - [ ] Implement service prioritization
  - [ ] Optimize container networking
- [ ] Development workflow improvements
  - [ ] Create specialized development scripts
  - [ ] Implement intelligent service restart
  - [ ] Configure hot module replacement where applicable

## Production Considerations
- [ ] Optimize Dockerfiles for production
- [ ] Configure environment-specific settings
- [ ] Set up health checks
- [ ] Configure resource limits
- [ ] Implement container security best practices
