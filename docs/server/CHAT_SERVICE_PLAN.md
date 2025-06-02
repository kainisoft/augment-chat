# Chat Service Implementation Plan

## Overview
The Chat Service handles private messaging, group chats, message history, and real-time chat features using GraphQL API, MongoDB for storage, and WebSocket subscriptions for real-time communication.

## Technology Stack
- NestJS with Fastify
- GraphQL with Apollo Server
- MongoDB for message storage
- Kafka for inter-service communication
- WebSocket subscriptions for real-time features
- Redis for caching and session management

## Current Implementation Status

Based on codebase audit performed on the current implementation, the following reflects the actual state of the chat service:

### Phase 1: Basic Infrastructure Setup
- ✅ **Initialize service with NestJS CLI**
  - ✅ Service created at `server/apps/chat-service/`
  - ✅ Basic NestJS structure in place
- ✅ **Configure Fastify adapter**
  - ✅ Bootstrap service configured with Fastify in `main.ts`
  - ✅ Port 4003 configured for Chat Service
- ☐ **Set up MongoDB connection**
  - ☐ MongoDB module integration
  - ☐ Database connection configuration
  - ☐ Connection health checks
- ☐ **Create message and conversation schemas**
  - ☐ MongoDB schemas for messages collection
  - ☐ MongoDB schemas for conversations collection
  - ☐ Schema validation and indexing

### Phase 2: GraphQL API Foundation
- ☐ **GraphQL module setup**
  - ☐ Apollo Server integration
  - ☐ GraphQL schema generation
  - ☐ GraphQL playground configuration
- ☐ **Core GraphQL types**
  - ☐ MessageType GraphQL object
  - ☐ ConversationType GraphQL object
  - ☐ ParticipantType GraphQL object
  - ☐ Input types for mutations
- ☐ **Basic resolvers**
  - ☐ Message resolver implementation
  - ☐ Conversation resolver implementation
  - ☐ Query resolvers for data retrieval
  - ☐ Mutation resolvers for data modification

### Phase 3: Core Messaging Features
- ☐ **Private messaging implementation**
  - ☐ Send message functionality
  - ☐ Message validation and sanitization
  - ☐ Private conversation creation
  - ☐ Message persistence to MongoDB
- ☐ **Message history functionality**
  - ☐ Retrieve conversation messages
  - ☐ Pagination implementation
  - ☐ Message ordering by timestamp
  - ☐ Performance optimization with indexing
- ☐ **Basic group chat capability**
  - ☐ Group conversation creation
  - ☐ Participant management
  - ☐ Group message broadcasting
  - ☐ Group metadata handling
- ☐ **Message delivery status**
  - ☐ Delivery confirmation tracking
  - ☐ Read receipt implementation
  - ☐ Status update mechanisms
  - ☐ Real-time status broadcasting

### Phase 4: Real-time Communication
- ☐ **WebSocket subscriptions setup**
  - ☐ GraphQL subscription resolver implementation
  - ☐ WebSocket gateway configuration
  - ☐ Real-time message broadcasting
  - ☐ Connection management and authentication
- ☐ **Real-time features**
  - ☐ Live message delivery via subscriptions
  - ☐ Typing indicators implementation
  - ☐ User presence status
  - ☐ Connection state management

### Phase 5: CQRS and Domain Architecture
- ☐ **CQRS implementation**
  - ☐ Command handlers for write operations
  - ☐ Query handlers for read operations
  - ☐ Event sourcing setup
  - ☐ Domain event publishing
- ☐ **Domain-driven design**
  - ☐ Message aggregate implementation
  - ☐ Conversation aggregate implementation
  - ☐ Domain services and value objects
  - ☐ Repository pattern implementation

### Phase 6: Advanced Features
- ☐ **File attachment support**
  - ☐ File upload handling
  - ☐ File storage integration (S3/MinIO)
  - ☐ File type validation and security
  - ☐ Attachment metadata management
- ☐ **Message search functionality**
  - ☐ Full-text search implementation
  - ☐ Search indexing optimization
  - ☐ Advanced search filters
  - ☐ Search result pagination
- ☐ **Message reactions and threading**
  - ☐ Emoji reactions system
  - ☐ Message threading support
  - ☐ Reply-to functionality
  - ☐ Reaction aggregation and display

### Phase 7: Integration and Events
- ☐ **Kafka integration**
  - ☐ Event producer setup
  - ☐ Event consumer implementation
  - ☐ Inter-service communication
  - ☐ Event handler registration
- ☐ **Security integration**
  - ☐ JWT authentication guards
  - ☐ Role-based access control
  - ☐ User context injection
  - ☐ Permission validation

### Phase 8: Performance and Monitoring
- ☐ **Caching implementation**
  - ☐ Redis integration for conversation caching
  - ☐ Message caching strategies
  - ☐ Cache invalidation patterns
  - ☐ Performance optimization
- ☐ **Monitoring and logging**
  - ☐ Structured logging integration
  - ☐ Performance metrics collection
  - ☐ Error tracking and alerting
  - ☐ Health check enhancements

## Database Schema

### Messages Collection
- `_id` (ObjectId): Primary key
- `conversationId` (ObjectId): Reference to conversation
- `senderId` (UUID): User who sent the message
- `content` (String): Message content
- `attachments` (Array): File attachments
- `createdAt` (DateTime): Message timestamp
- `updatedAt` (DateTime): Last update timestamp
- `deliveredTo` (Array): Users who received the message
- `readBy` (Array): Users who read the message

### Conversations Collection
- `_id` (ObjectId): Primary key
- `type` (Enum): Conversation type (private, group)
- `participants` (Array): User IDs in conversation
- `name` (String): Group chat name (for group chats)
- `createdAt` (DateTime): Conversation creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `lastMessageAt` (DateTime): Last message timestamp

### Attachments Collection
- `_id` (ObjectId): Primary key
- `messageId` (ObjectId): Reference to message
- `fileName` (String): Original file name
- `fileType` (String): MIME type
- `fileSize` (Number): File size in bytes
- `storageUrl` (String): S3 or other storage URL
- `createdAt` (DateTime): Upload timestamp

## GraphQL API Specification

### GraphQL Endpoint
- `POST /graphql` - GraphQL endpoint for all operations
- `GET /graphql` - GraphQL playground (development only)

### GraphQL Queries
```graphql
# Get user conversations with pagination
query GetConversations($pagination: PaginationInput) {
  conversations(pagination: $pagination) {
    data {
      id
      type
      participants {
        id
        displayName
      }
      lastMessage {
        content
        timestamp
      }
    }
    pagination {
      page
      limit
      total
    }
  }
}

# Get conversation messages with pagination
query GetMessages($conversationId: ID!, $pagination: PaginationInput) {
  messages(conversationId: $conversationId, pagination: $pagination) {
    data {
      id
      content
      senderId
      timestamp
      status
      attachments {
        id
        fileName
        fileType
        fileSize
        url
      }
    }
    pagination {
      page
      limit
      total
    }
  }
}

# Search messages across conversations
query SearchMessages($query: String!, $pagination: PaginationInput) {
  searchMessages(query: $query, pagination: $pagination) {
    data {
      id
      content
      senderId
      conversationId
      timestamp
      highlights
    }
    pagination {
      page
      limit
      total
    }
  }
}
```

### GraphQL Mutations
```graphql
# Send a new message
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    senderId
    conversationId
    timestamp
    status
    attachments {
      id
      fileName
      fileType
      fileSize
      url
    }
  }
}

# Create a new conversation
mutation CreateConversation($input: CreateConversationInput!) {
  createConversation(input: $input) {
    id
    type
    participants {
      id
      displayName
    }
    name
    createdAt
  }
}

# Update message (edit content)
mutation UpdateMessage($messageId: ID!, $input: UpdateMessageInput!) {
  updateMessage(messageId: $messageId, input: $input) {
    id
    content
    updatedAt
    editHistory {
      content
      timestamp
    }
  }
}

# Delete message
mutation DeleteMessage($messageId: ID!) {
  deleteMessage(messageId: $messageId) {
    success
    messageId
  }
}

# Add reaction to message
mutation AddReaction($messageId: ID!, $reaction: String!) {
  addReaction(messageId: $messageId, reaction: $reaction) {
    messageId
    reactions {
      emoji
      count
      users {
        id
        displayName
      }
    }
  }
}
```

### GraphQL Subscriptions
```graphql
# Subscribe to new messages in a conversation
subscription MessageReceived($conversationId: ID!) {
  messageReceived(conversationId: $conversationId) {
    id
    content
    senderId
    timestamp
    status
    attachments {
      id
      fileName
      fileType
      fileSize
      url
    }
  }
}

# Subscribe to typing indicators
subscription TypingStatus($conversationId: ID!) {
  typingStatus(conversationId: $conversationId) {
    userId
    displayName
    isTyping
    timestamp
  }
}

# Subscribe to message status updates (read receipts, delivery)
subscription MessageStatusUpdated($conversationId: ID!) {
  messageStatusUpdated(conversationId: $conversationId) {
    messageId
    status
    userId
    timestamp
  }
}

# Subscribe to conversation updates
subscription ConversationUpdated($conversationId: ID!) {
  conversationUpdated(conversationId: $conversationId) {
    id
    type
    participants {
      id
      displayName
      status
    }
    lastMessage {
      content
      timestamp
    }
    unreadCount
  }
}
```

### Health Checks
- `GET /health` - Service health check endpoint
- `GET /health/detailed` - Detailed health check with component status

## Implementation Roadmap

### Current Status Summary
**✅ Completed (2/8 phases):**
- Basic NestJS service structure
- Fastify adapter configuration
- Logging integration
- Health check endpoints

**🚧 In Progress (0/8 phases):**
- None currently in progress

**☐ Pending (6/8 phases):**
- MongoDB connection and schemas
- GraphQL API implementation
- Core messaging features
- Real-time communication
- CQRS and domain architecture
- Advanced features
- Integration and events
- Performance and monitoring

### Next Steps (Priority Order)

#### Immediate Priority (Phase 1 Completion)
1. **MongoDB Integration**
   - Add MongoDB module to chat-service
   - Configure database connection
   - Implement connection health checks
   - Create database initialization scripts

2. **Database Schema Implementation**
   - Create Mongoose schemas for messages and conversations
   - Implement schema validation
   - Add database indexes for performance
   - Set up database migrations

#### Short-term Goals (Phase 2-3)
3. **GraphQL Foundation**
   - Install and configure Apollo Server
   - Set up GraphQL module structure
   - Create basic GraphQL types and resolvers
   - Implement GraphQL playground

4. **Core Messaging MVP**
   - Implement basic message sending
   - Create conversation management
   - Add message history retrieval
   - Implement basic validation

#### Medium-term Goals (Phase 4-5)
5. **Real-time Features**
   - WebSocket subscription implementation
   - Live message broadcasting
   - Typing indicators
   - Connection management

6. **CQRS Architecture**
   - Command and query separation
   - Event sourcing implementation
   - Domain model development
   - Repository pattern

#### Long-term Goals (Phase 6-8)
7. **Advanced Features**
   - File attachments
   - Message search
   - Reactions and threading
   - Performance optimization

8. **Production Readiness**
   - Kafka integration
   - IAM security
   - Monitoring and metrics
   - Load testing and optimization

## Technical Requirements

### Dependencies to Add
```json
{
  "dependencies": {
    "@nestjs/graphql": "^12.0.0",
    "@nestjs/apollo": "^12.0.0",
    "apollo-server-express": "^3.12.0",
    "graphql": "^16.8.0",
    "mongoose": "^8.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  }
}
```

### Environment Variables Required
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chat_db
MONGODB_OPTIONS={}

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true

# WebSocket Configuration
WEBSOCKET_PORT=4003
WEBSOCKET_CORS_ORIGIN=http://localhost:3000

# Redis Configuration (for subscriptions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=chat-service
```

### Shared Module Dependencies
- `@app/database` - Database connection and utilities
- `@app/graphql` - GraphQL utilities and decorators
- `@app/validation` - Validation decorators and pipes
- `@app/dtos` - Shared data transfer objects
- `@app/domain` - Domain models and value objects
- `@app/events` - Event interfaces and handlers
- `@app/kafka` - Kafka producer and consumer
- `@app/redis` - Redis caching and pub/sub
- `@app/security` - Authentication and authorization
- `@app/logging` - Centralized logging (already integrated)
- `@app/testing` - Testing utilities and mocks

## Success Criteria

### Phase 1 Success Criteria
- [ ] MongoDB connection established and health checks pass
- [ ] Database schemas created and validated
- [ ] Basic CRUD operations working
- [ ] Integration tests passing

### Phase 2 Success Criteria
- [ ] GraphQL endpoint responding
- [ ] Basic queries and mutations working
- [ ] GraphQL playground accessible
- [ ] Type safety implemented

### Phase 3 Success Criteria
- [ ] Send and receive messages working
- [ ] Conversation creation and management
- [ ] Message history with pagination
- [ ] Basic validation and error handling

### Phase 4 Success Criteria
- [ ] Real-time message delivery via subscriptions
- [ ] WebSocket connections stable
- [ ] Typing indicators functional
- [ ] Connection authentication working

### Final Success Criteria
- [ ] All GraphQL operations implemented
- [ ] Real-time features working reliably
- [ ] CQRS pattern properly implemented
- [ ] Performance targets met (see benchmarks below)
- [ ] Security requirements satisfied
- [ ] Monitoring and logging comprehensive

## Performance Benchmarks

### Target Performance Metrics
- **Message Throughput**: 1000+ messages/second sustained
- **WebSocket Connections**: 500+ concurrent connections
- **Response Time**: <30ms for GraphQL queries, <10ms for subscriptions
- **Memory Usage**: <50MB average per service instance
- **Database Query Time**: <5ms for message retrieval, <10ms for search

### Load Testing Requirements
- Simulate 100 concurrent users
- 1000 messages per minute sustained load
- 50 concurrent WebSocket connections per user
- Message history retrieval under load
- Search functionality performance testing
