# Port Allocation Strategy

This document defines the port allocation strategy for the chat application project to avoid conflicts and maintain consistency across all services.

## Overview

The project uses a structured port allocation approach to ensure no conflicts between services and to provide clear organization for development and deployment.

## Port Ranges

### Backend Services (4000-4999)
- **4000**: Apollo Federation Gateway (GraphQL API)
- **4001**: WebSocket Gateway (Real-time communication)
- **4002**: Authentication Service
- **4003**: User Service
- **4004**: Chat Service
- **4005**: Notification Service
- **4006-4099**: Reserved for additional microservices
- **4100-4199**: Reserved for service-specific debugging ports

### Frontend Applications (5000-5999)
#### External Access Ports (5100-5199)
- **5100**: Next.js Chat Application (external access)
- **5101**: Next.js Documentation Site (external access)
- **5102-5109**: Reserved for additional Next.js applications
- **5110-5119**: Reserved for other frontend frameworks (React, Vue, etc.)
- **5120-5199**: Reserved for frontend development tools

#### Internal Docker Ports (5000-5099)
- **5000**: Next.js Chat Application (internal Docker port)
- **5001**: Next.js Documentation Site (internal Docker port)
- **5002-5099**: Reserved for internal frontend service ports

### Infrastructure Services (3000-3999)
- **3000**: Reserved for local development servers
- **3001**: Grafana (Monitoring Dashboard)
- **3002**: Prometheus (Metrics Collection)
- **3003**: Jaeger (Distributed Tracing)
- **3004-3099**: Reserved for monitoring and observability tools
- **3100-3199**: Reserved for development tools
- **3200-3299**: Reserved for testing tools

### Database Services (5432, 27017, 6379, etc.)
- **5432**: PostgreSQL (standard port)
- **27017**: MongoDB (standard port)
- **6379-6384**: Redis Cluster (6 nodes)
- **9092**: Kafka (standard port)
- **2181**: Zookeeper (standard port)

### Debug Ports (9229+)
- **9229**: Auth Service Debug Port
- **9230**: User Service Debug Port
- **9231**: Chat Service Debug Port
- **9232**: Notification Service Debug Port
- **9233**: WebSocket Gateway Debug Port
- **9234**: API Gateway Debug Port

## Current Service Mapping

### Production/External Access
```
┌─────────────────────────────────────────────────────────────┐
│                    External Access Ports                    │
├─────────────────────────────────────────────────────────────┤
│ http://localhost:5100  │ Next.js Chat Application           │
│ http://localhost:5101  │ Next.js Documentation Site         │
│ http://localhost:4000  │ GraphQL Playground (Apollo Gateway)│
│ http://localhost:4001  │ WebSocket Gateway                  │
│ http://localhost:3001  │ Grafana Dashboard                  │
└─────────────────────────────────────────────────────────────┘
```

### Internal Docker Network
```
┌─────────────────────────────────────────────────────────────┐
│                   Internal Docker Ports                     │
├─────────────────────────────────────────────────────────────┤
│ api-gateway:4000       │ Apollo Federation Gateway          │
│ websocket-gateway:4001 │ WebSocket Gateway                  │
│ auth-service:4002      │ Authentication Service             │
│ user-service:4003      │ User Service                       │
│ chat-service:4004      │ Chat Service                       │
│ nextjs-chat:5000       │ Next.js Chat App (internal)        │
│ nextjs-chat:5001       │ Next.js Docs App (internal)        │
└─────────────────────────────────────────────────────────────┘
```

## Port Conflict Resolution

### Common Conflicts
1. **Port 5000**: Often used by macOS AirPlay Receiver
   - **Solution**: Use external port 5100 for Next.js Chat App
   - **Mapping**: `5100:5000` in Docker Compose

2. **Port 3000**: Commonly used by development servers
   - **Solution**: Use port 3001 for Grafana, avoid 3000 entirely
   - **Mapping**: `3001:3000` for Grafana

3. **Port 8080**: Often used by other applications
   - **Solution**: Use 4000+ range for backend services
   - **Status**: Not currently used in our stack

### Checking for Port Conflicts
```bash
# Check if ports are in use
lsof -i :5100  # Next.js Chat (external)
lsof -i :5101  # Next.js Docs (external)
lsof -i :4000  # Apollo Gateway
lsof -i :4001  # WebSocket Gateway
lsof -i :3001  # Grafana

# Stop conflicting services
./docker/scripts/dev.sh down
```

## Development Workflow

### Starting Services
```bash
# Start infrastructure (databases, monitoring)
./docker/scripts/dev.sh infra

# Start backend services
./docker/scripts/dev.sh api      # Apollo Gateway (4000)
./docker/scripts/dev.sh websocket # WebSocket Gateway (4001)

# Start frontend
./docker/scripts/dev.sh frontend  # Next.js Apps (5100, 5101)
```

### Accessing Services
```bash
# Frontend Applications
open http://localhost:5100  # Chat Application
open http://localhost:5101  # Documentation

# Backend APIs
open http://localhost:4000/graphql  # GraphQL Playground

# Monitoring
open http://localhost:3001  # Grafana Dashboard
```

## Future Expansion

### Adding New Services
1. **New Backend Service**: Use next available port in 4000+ range
2. **New Frontend Framework**: Use 5110+ range for external access
3. **New Infrastructure Tool**: Use 3100+ range

### Port Reservation
- Always reserve a block of 10 ports for each service type
- Document new port assignments in this file
- Update Docker Compose and environment files accordingly

## Environment Configuration

### Frontend Environment Variables
```env
# External URLs (for client-side requests)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_WEBSOCKET_ENDPOINT=ws://localhost:4001
NEXTAUTH_URL=http://localhost:5100

# Internal URLs (for SSR requests)
GRAPHQL_ENDPOINT=http://api-gateway:4000/graphql
WEBSOCKET_ENDPOINT=ws://websocket-gateway:4001
```

### Backend Environment Variables
```env
# Service ports
PORT=4000  # Apollo Gateway
PORT=4001  # WebSocket Gateway
PORT=4002  # Auth Service
PORT=4003  # User Service
PORT=4004  # Chat Service
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5100

# Kill process if needed
kill -9 <PID>

# Or stop all Docker services
./docker/scripts/dev.sh down
```

### Service Not Accessible
1. Check if service is running: `docker ps`
2. Check port mapping in docker-compose.yml
3. Verify firewall settings
4. Check service health: `./docker/scripts/dev.sh health`

## References

- [Docker Compose Port Mapping](https://docs.docker.com/compose/networking/)
- [Next.js Configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [NestJS Port Configuration](https://docs.nestjs.com/first-steps)
