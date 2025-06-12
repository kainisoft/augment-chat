# Frontend Docker Configuration

This document describes the Docker setup for the Next.js frontend application, integrated with the existing backend microservices infrastructure.

## Overview

The Next.js frontend is containerized and integrated into the existing Docker Compose setup, allowing for seamless development alongside the NestJS backend microservices.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Chat  │    │ Apollo Gateway  │    │ WebSocket GW    │
│   Port: 5100    │◄──►│   Port: 4000    │    │   Port: 4001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Chat Network   │
                    │   (Docker)      │
                    └─────────────────┘
```

## Quick Start

### Start Frontend with Backend Services

```bash
# Start all infrastructure services (databases, Kafka, Redis)
./docker/scripts/dev.sh infra

# Start API Gateway and WebSocket Gateway
./docker/scripts/dev.sh api
./docker/scripts/dev.sh websocket

# Start the Next.js frontend
./docker/scripts/dev.sh frontend
```

### Start Everything at Once

```bash
# Start all services including frontend
./docker/scripts/dev.sh all
```

## Available Commands

### Frontend-Specific Commands

```bash
# Start Next.js frontend with dependencies
./docker/scripts/dev.sh frontend
./docker/scripts/dev.sh web  # alias

# Rebuild Next.js frontend
./docker/scripts/dev.sh build:frontend
./docker/scripts/dev.sh build:web  # alias

# View frontend logs
./docker/scripts/dev.sh logs nextjs-chat

# Restart frontend service
./docker/scripts/dev.sh restart nextjs-chat
```

### Development Workflow

```bash
# 1. Start infrastructure
./docker/scripts/dev.sh infra

# 2. Start backend services
./docker/scripts/dev.sh api
./docker/scripts/dev.sh websocket

# 3. Start frontend
./docker/scripts/dev.sh frontend

# 4. Access applications
# - Next.js Chat App: http://localhost:5100
# - Next.js Docs: http://localhost:5101
# - GraphQL Playground: http://localhost:4000/graphql
# - Grafana: http://localhost:3001
```

## Service Configuration

### Ports

- **5100**: Next.js Chat Application (external access)
- **5101**: Next.js Documentation Site (external access)
- **5000**: Next.js Chat Application (internal Docker port)
- **5001**: Next.js Documentation Site (internal Docker port)
- **3001**: Grafana (monitoring dashboard)

### Environment Variables

The frontend uses environment variables for backend service communication:

**Public Variables (Client-side)**:
- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: GraphQL API endpoint
- `NEXT_PUBLIC_WEBSOCKET_ENDPOINT`: WebSocket endpoint
- `NEXT_PUBLIC_AUTH_SERVICE_URL`: Authentication service
- `NEXT_PUBLIC_DEBUG`: Enable debug mode

**Server Variables (SSR)**:
- `GRAPHQL_ENDPOINT`: Internal Docker network GraphQL endpoint
- `WEBSOCKET_ENDPOINT`: Internal Docker network WebSocket endpoint

### Hot Reload

The Docker setup supports hot reload for development:

- File changes are automatically detected
- Next.js Turbopack is enabled for faster builds
- Volume mounts ensure real-time synchronization

## File Structure

```
docker/
├── Dockerfiles/
│   └── nextjs-chat.Dockerfile    # Next.js container definition
├── config/
│   └── nextjs-chat/
│       └── nextjs-chat.env       # Environment configuration
└── scripts/
    └── dev.sh                    # Updated with frontend commands

client/web/nextjs/
├── apps/
│   ├── chat/                     # Main chat application
│   │   ├── .env.docker          # Docker-specific environment
│   │   └── next.config.js       # Docker-optimized configuration
│   └── docs/                     # Documentation site
└── packages/                     # Shared packages
```

## Development Features

### Hot Reload Configuration

The Docker setup includes optimized hot reload:

```javascript
// next.config.js
webpackDevMiddleware: config => {
  config.watchOptions = {
    poll: 1000,
    aggregateTimeout: 300,
  };
  return config;
}
```

### Network Communication

- **Frontend to Backend**: Uses `localhost` URLs for client-side requests
- **SSR to Backend**: Uses Docker service names for server-side requests
- **WebSocket**: Connects directly to WebSocket Gateway on port 4001

### Volume Mounts

Optimized for development with selective mounting:

```yaml
volumes:
  - ./client/web/nextjs/apps:/app/apps:delegated
  - ./client/web/nextjs/packages:/app/packages:delegated
  - nextjs-chat-node-modules:/app/node_modules  # Cached node_modules
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :5100
   lsof -i :5101

   # Stop conflicting services
   ./docker/scripts/dev.sh down
   ```

2. **Hot Reload Not Working**
   ```bash
   # Rebuild the frontend container
   ./docker/scripts/dev.sh build:frontend
   
   # Restart the service
   ./docker/scripts/dev.sh restart nextjs-chat
   ```

3. **Backend Connection Issues**
   ```bash
   # Check if backend services are running
   ./docker/scripts/dev.sh status
   
   # Check service health
   ./docker/scripts/dev.sh health
   ```

4. **Environment Variables Not Loading**
   ```bash
   # Check environment file
   cat docker/config/nextjs-chat/nextjs-chat.env
   
   # Restart with fresh environment
   ./docker/scripts/dev.sh down
   ./docker/scripts/dev.sh frontend
   ```

### Logs and Debugging

```bash
# View frontend logs
./docker/scripts/dev.sh logs nextjs-chat

# View all service logs
./docker/scripts/dev.sh logs

# Check container status
docker ps | grep nextjs-chat

# Execute commands in container
docker exec -it pet6-nextjs-chat-1 sh
```

## Performance Optimization

### Build Optimization

- **Turbopack**: Enabled for faster development builds
- **Layer Caching**: Optimized Dockerfile with BuildKit cache mounts
- **Volume Caching**: Separate volume for node_modules

### Development Speed

- **Selective Mounting**: Only necessary files are mounted
- **Polling Configuration**: Optimized for Docker file watching
- **Parallel Builds**: Turborepo handles parallel package builds

## Integration with Backend

### GraphQL Integration

The frontend automatically connects to the Apollo Federation Gateway:

```typescript
// Apollo Client configuration
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});
```

### WebSocket Integration

Real-time features connect to the WebSocket Gateway:

```typescript
// WebSocket connection
const wsClient = new WebSocketClient({
  url: process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT,
});
```

### Authentication Flow

The frontend integrates with the authentication service:

1. Login requests go to Auth Service (port 4002)
2. JWT tokens are stored securely
3. GraphQL requests include authentication headers
4. WebSocket connections authenticate on connect

## Production Considerations

While this setup is optimized for development, production deployment would require:

- Multi-stage Dockerfile for optimized production builds
- Static file serving through CDN
- Environment-specific configuration
- Security hardening
- Performance monitoring

For production deployment, refer to the main deployment documentation.
