# API Gateway GraphQL Module

This module implements Apollo Federation Gateway with enhanced development tools and GraphQL playground support.

## Overview

The API Gateway GraphQL module provides:

- **Apollo Federation Gateway**: Combines schemas from User Service and Chat Service
- **GraphQL Playground**: Interactive development environment
- **Development Tools**: Query examples, documentation, and debugging utilities
- **Schema Introspection**: Real-time schema exploration
- **Cross-Service Queries**: Seamless data fetching across microservices

## Architecture

```
┌───────────────────────────────────────────┐
│           API Gateway (Port 4000)         │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │     Apollo Federation Gateway        │ │
│  │                                      │ │
│  │  ┌─────────────┐ ┌─────────────────┐ │ │
│  │  │ User Service│ │  Chat Service   │ │ │
│  │  │ (Port 4002) │ │  (Port 4003)    │ │ │
│  │  │             │ │                 │ │ │
│  │  │ • Users     │ │ • Conversations │ │ │
│  │  │ • Auth      │ │ • Messages      │ │ │
│  │  │ • Relations │ │ • Participants  │ │ │
│  │  └─────────────┘ └─────────────────┘ │ │
│  └──────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

## Features

### 🎮 GraphQL Playground

- **Interactive IDE**: Test queries and mutations in real-time
- **Schema Explorer**: Browse federated schema with documentation
- **Query History**: Save and reuse queries
- **Variable Editor**: Test with different input parameters
- **Authentication**: Support for JWT token testing

**Access**: `http://localhost:4000/graphql`

### 📚 Development Tools

- **Query Examples**: Pre-built queries for testing
- **API Documentation**: Comprehensive schema documentation
- **Federation Info**: Service status and configuration
- **Development Dashboard**: Centralized development tools

**Access**: `http://localhost:4000/graphql-dev`

### 🔧 Development Endpoints

| Endpoint | Description |
|----------|-------------|
| `/graphql` | Main GraphQL endpoint with playground |
| `/graphql-dev` | Development tools dashboard |
| `/graphql-dev/docs` | API documentation |
| `/graphql-dev/examples` | Query examples and variables |
| `/graphql-dev/federation` | Federation status and info |
| `/graphql-dev/playground-config` | Playground configuration |

## Configuration

### Environment Variables

```env
# GraphQL Configuration
GRAPHQL_DEBUG=true
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_SCHEMA_FILE_ENABLED=false

# Development Tools
GRAPHQL_DEV_TOOLS_ENABLED=true
GRAPHQL_EXAMPLES_ENABLED=true
GRAPHQL_FEDERATION_INFO_ENABLED=true

# Service URLs
USER_SERVICE_GRAPHQL_URL=http://user-service:4002/graphql
CHAT_SERVICE_GRAPHQL_URL=http://chat-service:4003/graphql

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:4000
CORS_CREDENTIALS=true

# Performance Limits
QUERY_COMPLEXITY_LIMIT=2000
QUERY_DEPTH_LIMIT=15
```

### Apollo Studio Integration (Optional)

For production monitoring and schema management:

```env
APOLLO_KEY=your-apollo-studio-key
APOLLO_GRAPH_REF=your-graph-ref
```

## Example Queries

### User Service Queries

```graphql
# Get User Profile
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    username
    displayName
    email
    createdAt
  }
}

# List Users
query ListUsers($filter: UserFilterInput) {
  users(filter: $filter) {
    id
    username
    displayName
    isActive
  }
}
```

### Chat Service Queries

```graphql
# Get Conversations
query GetConversations {
  conversations {
    id
    title
    type
    participants {
      id
      username
    }
    lastMessage {
      content
      createdAt
    }
  }
}

# Get Messages
query GetMessages($conversationId: ID!) {
  messages(conversationId: $conversationId) {
    id
    content
    sender {
      id
      username
    }
    createdAt
  }
}
```

### Federation Queries

```graphql
# Cross-Service Query
query UserWithConversations($userId: ID!) {
  user(id: $userId) {
    id
    username
    displayName
    conversations {
      id
      title
      lastMessage {
        content
        createdAt
      }
    }
  }
}
```

## Development Workflow

### 1. Start Services

```bash
# Start all services with Docker
./docker/scripts/dev.sh

# Or start individual services
cd server
pnpm start:dev api-gateway
pnpm start:dev user-service
pnpm start:dev chat-service
```

### 2. Access Development Tools

1. **GraphQL Playground**: http://localhost:4000/graphql
2. **Development Dashboard**: http://localhost:4000/graphql-dev
3. **API Documentation**: http://localhost:4000/graphql-dev/docs

### 3. Test Federation

1. Open GraphQL Playground
2. Use the provided example queries
3. Test cross-service data fetching
4. Verify schema composition

### 4. Debug Issues

- Check service health: http://localhost:4000/health
- View federation info: http://localhost:4000/graphql-dev/federation
- Monitor logs for schema composition errors

## Security

### Development Mode

- GraphQL Playground enabled
- Schema introspection enabled
- Detailed error messages
- Development endpoints accessible

### Production Mode

- GraphQL Playground disabled
- Schema introspection disabled
- Sanitized error messages
- Development endpoints disabled

## Troubleshooting

### Common Issues

1. **Schema Composition Errors**
   - Check service availability
   - Verify federation directives
   - Review service logs

2. **CORS Issues**
   - Update CORS_ORIGIN environment variable
   - Ensure credentials are properly configured

3. **Authentication Errors**
   - Verify JWT token format
   - Check Authorization header
   - Validate token expiration

### Debug Commands

```bash
# Check service health
curl http://localhost:4000/health

# Test GraphQL endpoint
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# View federation status
curl http://localhost:4000/graphql-dev/federation
```

## Files Structure

```
src/graphql/
├── graphql.module.ts              # Main GraphQL module
├── development-tools.service.ts   # Development utilities
├── development.controller.ts      # Development endpoints
└── README.md                      # This documentation
```

## Related Documentation

- [API Gateway Plan](../../../../docs/server/API_GATEWAY_PLAN.md)
- [User Service GraphQL](../../../user-service/src/graphql/README.md)
- [Chat Service GraphQL](../../../chat-service/src/graphql/README.md)
- [Apollo Federation Documentation](https://www.apollographql.com/docs/federation/)
