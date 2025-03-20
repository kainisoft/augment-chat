# Real-time Chat App

A modern chat application with real-time messaging capabilities built with Next.js, NestJS, GraphQL, and WebSocket subscriptions.

## Tech Stack

### Frontend
- Next.js + React
- Apollo Client
- GraphQL with WebSocket subscriptions
- TypeScript

### Backend
- NestJS + Fastify
- Apollo Server
- GraphQL subscriptions
- PostgreSQL
- Redis
- TypeScript

## Prerequisites

- Node.js 20.x
- pnpm 8.x
- Docker and Docker Compose
- PostgreSQL 15 (if running locally)
- Redis 7 (if running locally)

## Development Setup

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd real-time-chat-app
```

2. Start all services:
```bash
docker compose up
```

The following services will be available:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- GraphQL Playground: http://localhost:4000/graphql
- WebSocket subscriptions: ws://localhost:4000/graphql/subscriptions

### Manual Setup

#### Frontend

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql/subscriptions
```

4. Start development server:
```bash
pnpm dev
```

#### Backend

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env`:
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
```

4. Start development server:
```bash
pnpm start:dev
```

## Docker Commands

### Build and start all services
```bash
docker compose up --build
```

### Start specific service
```bash
docker compose up client
docker compose up server
```

### View logs
```bash
docker compose logs -f [service_name]
```

### Stop all services
```bash
docker compose down
```

### Remove volumes
```bash
docker compose down -v
```

## Project Structure

```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── graphql/      # GraphQL queries, mutations, subscriptions
│   │   ├── contexts/     # React contexts
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
│
├── server/                # Backend application
│   ├── src/
│   │   ├── controllers/  # NestJS controllers
│   │   ├── models/       # Data models
│   │   ├── graphql/      # GraphQL resolvers and type definitions
│   │   └── middleware/   # Custom middleware
│   └── test/             # Test files
│
└── docker-compose.yml    # Docker compose configuration
```

## Testing

### Frontend
```bash
cd client
pnpm test          # Run tests
pnpm test:watch    # Watch mode
pnpm test:cov      # Coverage report
```

### Backend
```bash
cd server
pnpm test          # Run tests
pnpm test:watch    # Watch mode
pnpm test:cov      # Coverage report
```

## Code Style

- Frontend and Backend use ESLint and Prettier
- Max line length: 80 characters
- Single quotes for strings
- 2 spaces for indentation

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case
- GraphQL:
  - Types: PascalCase
  - Queries/Mutations: camelCase

## Deployment

The application is configured for AWS deployment with:
- EC2 for compute
- ALB for load balancing
- RDS PostgreSQL for database
- ElastiCache Redis for caching
- CloudFront for CDN

## License

[Your License Here]