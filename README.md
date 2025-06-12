# Chat Application

A modern real-time chat application built with microservice architecture, featuring NestJS backend services, multiple frontend framework implementations, and comprehensive real-time messaging capabilities.

## 🏗️ Architecture Overview

### Hybrid GraphQL Architecture ✅ **In Production**
- **Apollo Federation Gateway** (Port 4000): Handles queries and mutations
- **WebSocket Gateway** (Port 4001): Dedicated real-time subscriptions
- **Microservice Communication**: Kafka-based event-driven architecture
- **Domain-Driven Design**: CQRS patterns with rich domain models

### Project Structure

```
├── server/                   # NestJS monorepo with microservices
│   ├── apps/                 # Microservice applications
│   │   ├── api-gateway/      # Apollo Federation Gateway (4000)
│   │   ├── websocket-gateway/# WebSocket Gateway (4001)
│   │   ├── auth-service/     # Authentication Service (4002)
│   │   ├── user-service/     # User Management Service (4003)
│   │   ├── chat-service/     # Chat Functionality Service (4004)
│   │   ├── notification-service/ # Notification Service (4005)
│   │   └── logging-service/  # Centralized Logging Service (4006)
│   └── libs/                 # 17+ Shared Libraries
├── client/                   # Frontend implementations
│   ├── web/                  # Web framework implementations
│   │   ├── nextjs/          # Next.js implementation (primary)
│   │   ├── remix/           # 📋 Planned: Remix implementation
│   │   ├── nuxtjs/          # 📋 Planned: Nuxt.js implementation
│   │   └── sveltekit/       # 📋 Planned: SvelteKit implementation
│   └── mobile/              # 📋 Planned: Mobile implementations
├── docker/                  # Docker configuration and scripts
└── docs/                    # Comprehensive project documentation
```

## 🚀 Current Technology Stack

### Backend Services ✅ **In Production**

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| **Apollo Federation Gateway** | 4000 | ✅ Production | GraphQL Federation for queries/mutations |
| **WebSocket Gateway** | 4001 | ✅ Production | Real-time subscriptions via GraphQL Yoga |
| **Auth Service** | 4002 | ✅ Production | JWT authentication & authorization |
| **User Service** | 4003 | ✅ Production | User profiles & relationships |
| **Chat Service** | 4004 | ✅ Production | Chat messages & conversations |
| **Notification Service** | 4005 | ✅ Production | Push notifications & alerts |
| **Logging Service** | 4006 | ✅ Production | Centralized logging with Loki integration |

### Infrastructure ✅ **In Production**

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| **PostgreSQL** | 5432 | ✅ Production | Primary database with Drizzle ORM |
| **MongoDB** | 27017 | ✅ Production | Chat messages & unstructured data |
| **Redis Cluster** | 6379-6381 | ✅ Production | Session management & caching |
| **Kafka** | 9092 | ✅ Production | Event-driven microservice communication |

### Core Technologies ✅ **In Production**
- **Framework**: NestJS with Fastify (HTTP engine)
- **API**: GraphQL with Apollo Federation v2
- **ORM**: Drizzle ORM for type-safe database access
- **Authentication**: JWT with refresh token rotation
- **Architecture**: Domain-Driven Design (DDD) + CQRS
- **Package Manager**: pnpm for all dependency management
- **Containerization**: Docker with optimized development workflow

## 🚧 Technologies Under Active Development

### Frontend Framework Evaluation 🚧 **Under Development**
- **Next.js Implementation** (Primary): `client/web/nextjs/`
  - ✅ Project structure established
  - 🚧 GraphQL integration with Apollo Client
  - 🚧 WebSocket real-time subscriptions
  - 📋 Authentication flow implementation
- **Framework Comparison**: Evaluating Remix, Nuxt.js, SvelteKit, SolidStart
- **Independent Implementations**: Each framework in separate directories

### Security Enhancements 🚧 **Under Development**
- **@app/security Module**: Migration from @app/iam to centralized security
  - ✅ Rate limiting guards implemented
  - ✅ JWT authentication guards
  - 🚧 OAuth integration (Google, GitHub)
  - 📋 Two-factor authentication (2FA)
- **Enhanced Security Logging**: Comprehensive audit trails

### Advanced Features 📋 **Planned**
- **Performance Monitoring**: PM2 integration for application metrics
- **Advanced Caching**: Multi-layer caching strategies
- **File Upload Service**: S3-compatible file handling
- **Mobile Applications**: React Native and Flutter implementations

## 🛠️ Shared Libraries (17+ Libraries) ✅ **In Production**

Our microservices leverage a comprehensive set of shared libraries for consistency and code reuse:

### Core Infrastructure
- **@app/bootstrap** - Standardized service initialization
- **@app/config** - Environment configuration management
- **@app/logging** - Centralized logging with Kafka integration
- **@app/security** - Authentication, authorization & rate limiting
- **@app/validation** - Input validation and transformation

### Data & Communication
- **@app/database** - PostgreSQL with Drizzle ORM
- **@app/mongodb** - MongoDB integration and utilities
- **@app/redis** - Redis cluster management
- **@app/kafka** - Event-driven communication patterns
- **@app/graphql** - GraphQL utilities and federation support

### Domain & Application
- **@app/domain** - Shared domain models and value objects
- **@app/dtos** - Data Transfer Objects and API contracts
- **@app/events** - Domain events and event handlers
- **@app/common** - Common utilities and helpers

### Development & Testing
- **@app/testing** - Testing utilities and patterns
- **@app/metrics** - Performance monitoring utilities
- **@app/iam** - Legacy IAM (migrating to @app/security)

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** - Container orchestration
- **Node.js 18+** - Runtime environment
- **pnpm** - Package manager (required)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-application
```

2. **Start infrastructure services**
```bash
docker compose up -d postgres mongo kafka redis-node-1 redis-node-2 redis-node-3 redis-cluster-init
```

3. **Install dependencies and start services**
```bash
cd server
pnpm install
pnpm run start:dev
```

### Individual Service Management

```bash
cd server

# Start specific services
pnpm run start:dev api-gateway          # Apollo Federation Gateway (4000)
pnpm run start:dev websocket-gateway    # WebSocket Gateway (4001)
pnpm run start:dev auth-service         # Authentication Service (4002)
pnpm run start:dev user-service         # User Service (4003)
pnpm run start:dev chat-service         # Chat Service (4004)
pnpm run start:dev notification-service # Notification Service (4005)
pnpm run start:dev logging-service      # Logging Service (4006)
```

### Health Monitoring

Each microservice provides comprehensive health endpoints:

- **`/api/health`** - Complete health status with dependencies
- **`/api/health/liveness`** - Simple liveness probe
- **`/api/health/readiness`** - Readiness check with component status

```bash
# Check service health
curl http://localhost:4000/api/health  # API Gateway
curl http://localhost:4001/api/health  # WebSocket Gateway
curl http://localhost:4002/api/health  # Auth Service
```

## 🔧 Development Workflow

### Hot Module Replacement (HMR) ✅ **Optimized**

Our development environment features NestJS's built-in HMR for rapid development cycles:

#### Development Scripts
```bash
# Optimized HMR development script
./docker/scripts/hmr-dev.sh build auth-service    # Build with HMR
./docker/scripts/hmr-dev.sh run auth-service      # Run with HMR
./docker/scripts/hmr-dev.sh logs auth-service     # View logs
./docker/scripts/hmr-dev.sh stop auth-service     # Stop service

# Docker Compose alternative
docker-compose up -d                              # All services with HMR
docker-compose up -d auth-service                 # Specific service
```

#### HMR Benefits
- **⚡ Sub-second reload times** - Changes applied almost instantly
- **🔄 State preservation** - Application state maintained between updates
- **🚀 Enhanced DX** - No manual service restarts required
- **💾 Resource efficiency** - Only changed modules recompiled

### GraphQL Development ✅ **Production Ready**

#### Apollo Federation Gateway (Port 4000)
- **GraphQL Playground**: http://localhost:4000/graphql
- **Schema Introspection**: Real-time schema exploration
- **Federation Testing**: Cross-service query validation
- **Development Dashboard**: http://localhost:4000/graphql-dev

#### WebSocket Gateway (Port 4001)
- **Subscription Testing**: Real-time subscription debugging
- **Connection Monitoring**: WebSocket connection health
- **PubSub Testing**: Redis-based message broadcasting

### Frontend Development 🚧 **Under Development**

#### Next.js Primary Implementation
```bash
cd client/web/nextjs
pnpm install                    # Install dependencies
pnpm dev                       # Start development server (3000)
pnpm build                     # Production build
pnpm test                      # Run tests
pnpm codegen                   # Generate GraphQL types
```

#### Framework Evaluation Structure
- **Independent implementations** in `client/web/[framework]/`
- **No shared dependencies** between frameworks
- **Framework-specific optimizations** and patterns
- **Parallel development** capabilities

### Code Quality & Standards ✅ **Enforced**

```bash
cd server
pnpm run format                # Prettier formatting
pnpm run lint                  # ESLint validation
pnpm run test                  # Unit tests
pnpm run test:e2e             # End-to-end tests
pnpm run build:all           # Build all services
```

## 🌐 Production Deployment

### AWS Infrastructure ✅ **Production Ready**

The application is architected for AWS deployment with the following services:

| Component | AWS Service | Status | Description |
|-----------|-------------|--------|-------------|
| **Microservices** | ECS/EKS | ✅ Ready | Container orchestration |
| **PostgreSQL** | RDS | ✅ Ready | Managed relational database |
| **MongoDB** | DocumentDB | ✅ Ready | Managed document database |
| **Kafka** | MSK | ✅ Ready | Managed streaming platform |
| **Redis** | EC2 Cluster | ✅ Ready | Custom Redis cluster implementation |
| **Load Balancer** | ALB | ✅ Ready | Application load balancing |
| **File Storage** | S3 | 📋 Planned | Object storage for attachments |

### Deployment Features
- **Container-first architecture** with Docker optimization
- **Health check integration** for all services
- **Auto-scaling capabilities** based on metrics
- **Zero-downtime deployments** with rolling updates
- **Environment-specific configurations** (dev/staging/prod)

## 📊 Project Status & Roadmap

### ✅ Completed Milestones

#### Service Standardization (100% Complete)
We have successfully standardized architecture and patterns across all microservices, creating a consistent, maintainable, and scalable codebase.

**Achievements:**
- ✅ **17+ Shared Libraries**: Comprehensive infrastructure modules
- ✅ **100% Service Coverage**: All services follow standardized patterns
- ✅ **DDD + CQRS Implementation**: Domain-driven design with event sourcing
- ✅ **Performance Optimization**: Monitoring and optimization across all services
- ✅ **Testing Standardization**: Unified testing patterns and utilities
- ✅ **Security Integration**: Centralized @app/security module
- ✅ **Documentation**: Complete technical documentation

#### Backend Infrastructure (100% Complete)
- ✅ **Microservice Architecture**: 7 production-ready services
- ✅ **Apollo Federation**: Hybrid GraphQL architecture
- ✅ **Event-Driven Communication**: Kafka-based messaging
- ✅ **Database Integration**: PostgreSQL + MongoDB + Redis cluster
- ✅ **Authentication & Authorization**: JWT with refresh token rotation
- ✅ **Health Monitoring**: Comprehensive health checks and logging

### 🚧 Current Development Focus

#### Frontend Framework Evaluation (In Progress)
- 🚧 **Next.js Implementation**: Primary web client development
- 🚧 **GraphQL Integration**: Apollo Client with Federation Gateway
- 🚧 **Real-time Features**: WebSocket subscriptions implementation
- 📋 **Framework Comparison**: Remix, Nuxt.js, SvelteKit evaluation

#### Security Enhancements (In Progress)
- 🚧 **OAuth Integration**: Google, GitHub authentication
- 🚧 **Two-Factor Authentication**: TOTP and SMS-based 2FA
- 🚧 **Advanced Security Logging**: Comprehensive audit trails
- 📋 **Rate Limiting**: Advanced rate limiting strategies

### 📋 Upcoming Milestones

#### Q1 2024: Frontend Completion
- 📋 **Next.js Production**: Complete Next.js implementation
- 📋 **Mobile Applications**: React Native and Flutter development
- 📋 **Performance Optimization**: Bundle size and runtime optimization

#### Q2 2024: Advanced Features
- 📋 **File Upload Service**: S3-compatible file handling
- 📋 **Advanced Caching**: Multi-layer caching strategies
- 📋 **Monitoring Dashboard**: Real-time application monitoring

For detailed progress tracking, see:
- [Service Standardization Plan](docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Frontend Implementation Plans](docs/client/)
- [Security Implementation Guide](docs/server/SECURITY_STANDARDS_GUIDE.md)

## 📚 Documentation

Our comprehensive documentation is organized in the `docs/` directory and serves as the single source of truth for all technical decisions and implementation details.

### 🏗️ Architecture & Design
- **[Project Overview](docs/project/)** - High-level architecture and technology decisions
- **[Service Standardization](docs/server/SERVICE_STANDARDIZATION_PLAN.md)** - Microservice standardization approach
- **[Shared Infrastructure Modules](docs/server/SHARED_INFRASTRUCTURE_MODULES.md)** - 17+ shared libraries documentation
- **[DDD Implementation Guide](docs/server/DDD_IMPLEMENTATION_GUIDE.md)** - Domain-Driven Design patterns
- **[CQRS Implementation Plan](docs/server/CQRS_IMPLEMENTATION_PLAN.md)** - Command Query Responsibility Segregation

### 🔧 Development Standards
- **[Testing Standards Guide](docs/server/TESTING_STANDARDS_GUIDE.md)** - Testing patterns and utilities
- **[Validation Standards Guide](docs/server/VALIDATION_STANDARDS_GUIDE.md)** - Input validation patterns
- **[Security Standards Guide](docs/server/SECURITY_STANDARDS_GUIDE.md)** - Security implementation guidelines
- **[Performance Best Practices](docs/server/performance/PERFORMANCE_BEST_PRACTICES.md)** - Optimization techniques

### 🚀 Implementation Guides
- **[Server Implementation](docs/server/)** - Backend microservice implementation details
- **[Client Implementation](docs/client/)** - Frontend framework implementation plans
- **[API Gateway Plan](docs/server/API_GATEWAY_PLAN.md)** - Apollo Federation & WebSocket Gateway
- **[Database Design](docs/database/)** - PostgreSQL, MongoDB, and Redis schemas

### 🏭 Infrastructure & Deployment
- **[Infrastructure Setup](docs/infrastructure/)** - AWS infrastructure configuration
- **[Docker Configuration](docs/docker/)** - Container optimization and HMR setup
- **[Kafka Setup](docs/kafka/)** - Event-driven communication patterns
- **[Redis Implementation](docs/redis/)** - Cluster setup and caching strategies
- **[Deployment Plans](docs/deployment/)** - Production deployment procedures

### 📊 Monitoring & Performance
- **[Performance Documentation](docs/server/performance/)** - Monitoring and optimization
- **[Logging System](docs/logging/)** - Centralized logging with Loki integration
- **[Testing Strategy](docs/testing/)** - Comprehensive testing approach

### 📝 Documentation Standards
- **[Documentation Standard](docs/DOCUMENTATION_STANDARD.md)** - Formatting guidelines
- **[Document Templates](docs/TEMPLATE.md)** - Templates for new documentation
- **[Documentation Index](docs/README.md)** - Complete documentation catalog

## 🤝 Contributing

### Development Workflow
1. **Fork the repository** and create a feature branch
2. **Follow coding standards** and use provided shared libraries
3. **Write comprehensive tests** using our testing utilities
4. **Update documentation** following our documentation standards
5. **Submit a pull request** with detailed description

### Code Quality Requirements
- **Type Safety**: Full TypeScript implementation required
- **Testing**: Unit, integration, and E2E tests for new features
- **Documentation**: Update relevant documentation for changes
- **Performance**: Consider performance implications of changes
- **Security**: Follow security guidelines and use @app/security module

### Getting Help
- **Documentation**: Check comprehensive docs in `docs/` directory
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NestJS Team** - For the excellent framework and ecosystem
- **Apollo GraphQL** - For Federation and GraphQL tooling
- **Drizzle Team** - For the type-safe ORM implementation
- **Open Source Community** - For the amazing tools and libraries that make this project possible
