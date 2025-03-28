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

## Database Setup

### Neon PostgreSQL Setup

1. Sign up for a free account at [Neon](https://neon.tech)

2. Create a new project in Neon dashboard

3. Get your connection string from the dashboard:
   - Click on your project
   - Go to "Connection Details"
   - Copy the connection string

4. Enable required PostgreSQL extensions:
   ```sql
   -- Required for fuzzy text search functionality
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```
   
   You can enable this extension in several ways:
   - Using Neon's SQL Editor in the dashboard
   - Using any PostgreSQL client connected to your database
   - The extension will be automatically enabled through our migration scripts
   
   > **Important**: The `pg_trgm` extension is required for user search functionality. 
   > Our application uses GIN indexes with trigram operations for efficient username 
   > and email searches.

5. Set up your environment variables:
   ```bash
   # server/.env
   DATABASE_URL=postgres://[user]:[password]@[hostname]/[database]?sslmode=require
   ```

### Benefits of using Neon:

- Serverless: Pay only for what you use
- Auto-scaling: Handles traffic spikes automatically
- Database branching: Create instant database copies for testing
- Modern dashboard: Easy monitoring and management
- Generous free tier:
  - 3 projects
  - 10GB storage per project
  - Unlimited database branches
  - Serverless compute

### Development Workflow with Neon

1. Create branches for different environments:
   ```bash
   # Using Neon CLI
   neonctl branch create --name staging
   neonctl branch create --name development
   ```

2. Get connection strings for different branches:
   ```bash
   neonctl connection-string --branch staging
   neonctl connection-string --branch development
   ```

3. Use different branches for:
   - Development
   - Staging
   - Testing
   - Production

### Local Development Options

1. **Using Neon (Recommended)**:
   - Use a development branch
   - Real cloud environment
   - No local PostgreSQL needed

2. **Using Local PostgreSQL**:
   - Uncomment PostgreSQL service in docker-compose.yml
   - Update DATABASE_URL to use local instance
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
   ```

## Database Migrations

When using Neon, ensure your migration scripts handle SSL connections:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Neon direct connection
}
```

## Production Deployment

When deploying to production:

1. Use connection pooling for better performance:
   ```env
   DATABASE_URL=postgres://[user]:[password]@[pooler-hostname]/[database]?sslmode=require
   ```

2. Configure your application for serverless environments:
   - Use connection pooling
   - Handle connection limits
   - Implement retry logic

## Deployment

The application is configured for AWS deployment with:
- EC2 for compute
- ALB for load balancing
- RDS PostgreSQL for database
- ElastiCache Redis for caching
- CloudFront for CDN

## License

[Your License Here]
