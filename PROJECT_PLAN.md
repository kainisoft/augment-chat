# Chat Application Project Plan

This is the main dashboard for the Chat Application project. The plan has been organized by features and components for better clarity and management.

## Project Overview
- [Project Overview](docs/project/PROJECT_OVERVIEW.md) - Project description, technology stack, and high-level architecture
- [Testing Plan](docs/testing/TESTING_PLAN.md) - Comprehensive testing strategy using NestJS testing tools

## Server-Side Development
- [Server Development Overview](docs/server/SERVER_PLAN.md) - General server-side development phases

### Microservices
- [API Gateway Service](docs/server/API_GATEWAY_PLAN.md) - GraphQL API Gateway service plan
- [Authentication Service](docs/server/AUTH_SERVICE_PLAN.md) - Authentication service plan
- [User Service](docs/server/USER_SERVICE_PLAN.md) - User management service plan
- [Chat Service](docs/server/CHAT_SERVICE_PLAN.md) - Chat functionality service plan
- [Notification Service](docs/server/NOTIFICATION_SERVICE_PLAN.md) - Notifications service plan

## Client-Side Development
- [Web Client](docs/client/WEB_CLIENT_PLAN.md) - Next.js web application plan
- [Mobile Client](docs/client/MOBILE_CLIENT_PLAN.md) - Future mobile application plan

## Infrastructure & Deployment
- [Database Plan](docs/database/DATABASE_PLAN.md) - Database architecture and implementation
- [Docker Development Environment](docs/docker/DOCKER_PLAN.md) - Local development with Docker
- [AWS Deployment](docs/deployment/AWS_DEPLOYMENT_PLAN.md) - Production deployment on AWS

## Current Progress

### Server Development
- [x] Phase 1, Step 1: Initialize NestJS monorepo using Workspaces with Fastify
- [x] Phase 1, Step 2: Set up Docker configuration for local development
- [x] Phase 1, Step 3: Configure Kafka for local development
- [x] Phase 1, Step 4: Set up PostgreSQL and MongoDB with Docker Compose

### Client Development
- [ ] Phase 1, Step 1: Initialize Next.js web client project
- [ ] Phase 1, Step 2: Set up Next.js with Apollo Client
- [ ] Phase 1, Step 3: Configure project structure and styling with Tailwind CSS

### Infrastructure
- [x] Phase 1, Step 1: Create Docker Compose configuration for local development
- [x] Phase 1, Step 2: Set up service-specific Dockerfiles
- [x] Phase 1, Step 3: Configure ports 4000+ for all microservices

## Next Steps
1. Initialize the Next.js web client project
2. Implement authentication service functionality
3. Develop user service features
4. Create chat service core functionality
5. Set up notification service

## Special Implementation Notes
- Redis will be implemented as a custom Redis Cluster on EC2 instances in production
- All Redis communication will use private IP addresses for security
- Local development will simulate the cluster setup with Docker containers
- Microservices will use port 4000 and higher (API Gateway: 4000, Auth: 4001, User: 4002, Chat: 4003, Notification: 4004)
