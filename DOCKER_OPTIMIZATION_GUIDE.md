# Docker Optimization Guide for Local Development

This guide provides detailed implementation instructions for optimizing Docker containers in the local development environment, focusing on faster startup times and improved developer experience.

## 1. Implementing BuildKit for Faster Builds

### Enable BuildKit

BuildKit is Docker's next-generation builder that offers improved performance, storage management, and feature functionality.

#### For Docker Desktop:
- Go to Settings > Docker Engine
- Add the following JSON configuration:
```json
{
  "features": {
    "buildkit": true
  }
}
```

#### For Docker CLI:
- Set the environment variable before running Docker commands:
```bash
export DOCKER_BUILDKIT=1
```

- Or add to your shell profile (.bashrc, .zshrc, etc.):
```bash
echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
source ~/.bashrc
```

### Update Dockerfiles to Leverage BuildKit Features

#### Add BuildKit-specific syntax:
```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:18-alpine

# BuildKit-specific cache mounts for faster dependency installation
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Use cache mount for pnpm store
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
```

## 2. Optimizing Dependency Management

### Use pnpm's Frozen Lockfile Mode

Update Dockerfiles to use `--frozen-lockfile` flag:

```dockerfile
# Install dependencies with frozen lockfile for deterministic builds
RUN pnpm install --frozen-lockfile
```

### Implement Dependency Caching Strategy

#### For development Dockerfiles:
```dockerfile
# Copy only package files first
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Use BuildKit cache mount for faster installations
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile
```

### Configure Selective Package Installation

For microservices that only need specific packages:

```dockerfile
# Install only dependencies needed for this service
RUN pnpm install --frozen-lockfile --filter="./apps/auth-service"
```

## 3. Improving Volume Performance

### Implement Named Volumes for node_modules

Update docker-compose.yml to use named volumes for node_modules:

```yaml
services:
  auth-service:
    # ... other configuration
    volumes:
      - ./server:/app
      - auth-service-node-modules:/app/node_modules

volumes:
  auth-service-node-modules:
```

### Configure Selective Bind Mounts

Instead of mounting the entire project, mount only what's needed:

```yaml
volumes:
  - ./server/apps/auth-service:/app/apps/auth-service
  - ./server/libs:/app/libs
  - ./server/package.json:/app/package.json
  - ./server/pnpm-lock.yaml:/app/pnpm-lock.yaml
  - ./server/nest-cli.json:/app/nest-cli.json
  - ./server/tsconfig.json:/app/tsconfig.json
```

### Optimize Docker Volume Configuration

For macOS and Windows, consider using `:delegated` or `:cached` options:

```yaml
volumes:
  - ./server:/app:delegated
  - auth-service-node-modules:/app/node_modules
```

## 4. Enhancing Service Startup

### Implement Conditional Service Dependencies

Use healthchecks to ensure services start in the correct order:

```yaml
services:
  auth-service:
    # ... other configuration
    depends_on:
      postgres:
        condition: service_healthy
      kafka:
        condition: service_healthy

  postgres:
    # ... other configuration
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Create Service Profiles for Different Development Scenarios

Define profiles in docker-compose.yml:

```yaml
services:
  auth-service:
    # ... other configuration
    profiles: ["auth", "all"]

  user-service:
    # ... other configuration
    profiles: ["user", "all"]
```

Then start services by profile:

```bash
docker-compose --profile auth up
```

### Optimize Nodemon Configuration

Create a custom nodemon.json for faster reloading:

```json
{
  "watch": ["apps/auth-service/src", "libs"],
  "ext": "ts",
  "ignore": ["**/*.spec.ts"],
  "exec": "nest start auth-service --watch"
}
```

## 5. Resource Optimization

### Configure Appropriate Resource Limits

Set resource limits in docker-compose.yml:

```yaml
services:
  auth-service:
    # ... other configuration
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Implement Service Prioritization

Prioritize critical services:

```yaml
services:
  postgres:
    # ... other configuration
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### Optimize Container Networking

Use host networking for performance-critical services:

```yaml
services:
  kafka:
    # ... other configuration
    network_mode: "host"
```

## 6. Development Workflow Improvements

### Create Specialized Development Scripts

Add scripts to package.json:

```json
{
  "scripts": {
    "docker:db": "docker-compose up -d postgres mongo redis-node-1 redis-node-2 redis-node-3 redis-cluster-init",
    "docker:kafka": "docker-compose up -d zookeeper kafka",
    "docker:auth": "docker-compose --profile auth up",
    "docker:all": "docker-compose --profile all up"
  }
}
```

### Implement Intelligent Service Restart

Use Docker Compose's dependency graph to restart only affected services:

```bash
docker-compose up -d --no-deps auth-service
```

### Configure Hot Module Replacement

For NestJS services, enable webpack HMR:

```typescript
// main.ts
declare const module: any;

async function bootstrap() {
  // ... app initialization
  
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

## Implementation Strategy

1. Start with BuildKit and dependency optimizations for the fastest initial gains
2. Implement volume optimizations next to improve file system performance
3. Add service startup enhancements to reduce waiting time between services
4. Configure resource limits based on your development machine's capabilities
5. Finally, implement workflow improvements for day-to-day development

## Measuring Improvements

To measure the impact of optimizations:

1. Time the startup of services before and after changes:
   ```bash
   time docker-compose up -d auth-service
   ```

2. Monitor resource usage:
   ```bash
   docker stats
   ```

3. Track build times:
   ```bash
   time docker-compose build auth-service
   ```
