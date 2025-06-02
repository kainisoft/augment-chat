# Chat Service

## Overview

The Chat Service is responsible for real-time messaging, conversation management, and chat-related operations in the microservice architecture. It provides comprehensive messaging capabilities including private messages, group chats, and message history management.

## Features

- **GraphQL API**: Type-safe GraphQL endpoints with real-time subscriptions
- **Real-time Messaging**: WebSocket-based real-time message delivery via GraphQL subscriptions
- **Private Conversations**: One-on-one messaging between users
- **Group Chats**: Multi-user conversation support
- **Message History**: Persistent message storage and retrieval with pagination
- **Message Status**: Read receipts and delivery confirmations
- **File Attachments**: Support for file sharing in conversations
- **Message Search**: Full-text search across message content with GraphQL queries
- **CQRS Implementation**: Command Query Responsibility Segregation pattern
- **Event-Driven Architecture**: Kafka-based event publishing and handling

## Architecture

The service follows Domain-Driven Design (DDD) patterns and integrates with shared infrastructure modules:

- **GraphQL Resolvers**: Handle GraphQL queries, mutations, and subscriptions
- **Command Handlers**: Process write operations (CQRS)
- **Query Handlers**: Handle read operations (CQRS)
- **Services**: Implement business logic for messaging operations
- **Repositories**: Data access layer with command/query separation
- **Domain Objects**: Message, Conversation, Participant entities
- **Event Handlers**: Process messaging events from other services
- **WebSocket Gateway**: Real-time message broadcasting via GraphQL subscriptions

## API Endpoints

### GraphQL Endpoint
- `POST /graphql` - GraphQL endpoint for all operations
- `GET /graphql` - GraphQL playground (development only)

### GraphQL Operations

#### Queries
```graphql
# Get user conversations
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

# Get conversation messages
query GetMessages($conversationId: ID!, $pagination: PaginationInput) {
  messages(conversationId: $conversationId, pagination: $pagination) {
    data {
      id
      content
      senderId
      timestamp
      status
    }
    pagination {
      page
      limit
      total
    }
  }
}
```

#### Mutations
```graphql
# Send message
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    senderId
    timestamp
    status
  }
}

# Create conversation
mutation CreateConversation($input: CreateConversationInput!) {
  createConversation(input: $input) {
    id
    type
    participants {
      id
      displayName
    }
  }
}
```

#### Subscriptions
```graphql
# Subscribe to new messages
subscription MessageReceived($conversationId: ID!) {
  messageReceived(conversationId: $conversationId) {
    id
    content
    senderId
    timestamp
    status
  }
}

# Subscribe to typing indicators
subscription TypingStatus($conversationId: ID!) {
  typingStatus(conversationId: $conversationId) {
    userId
    isTyping
  }
}
```

### Health Monitoring
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

## Dependencies

### Shared Modules
- `@app/dtos` - Shared data transfer objects for messaging and GraphQL responses
- `@app/validation` - Shared validation decorators for GraphQL inputs
- `@app/security` - Security utilities, guards, and Identity and Access Management
- `@app/logging` - Centralized logging service
- `@app/testing` - Shared testing utilities and GraphQL test builders
- `@app/domain` - Shared domain models (UserId, MessageId, ConversationId, etc.)
- `@app/events` - Event interfaces for inter-service communication
- `@app/kafka` - Event publishing and consumption
- `@app/redis` - Caching and real-time data storage
- `@app/graphql` - GraphQL utilities, decorators, and subscription helpers

#### Shared Module Integration Examples

**Using GraphQL Input Validation:**
```typescript
import { IsUUIDField, IsStringField, IsOptionalField } from '@app/validation';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendMessageInput {
  @Field()
  @IsUUIDField({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  conversationId: string;

  @Field()
  @IsStringField({
    description: 'Message content',
    example: 'Hello, how are you?',
    minLength: 1,
    maxLength: 1000,
  })
  content: string;

  @Field({ nullable: true })
  @IsOptionalField()
  @IsStringField({
    description: 'Message type',
    example: 'text',
  })
  type?: string;
}
```

**Using Shared GraphQL DTOs:**
```typescript
import { GraphQLListResponse, GraphQLSearchPaginationInput } from '@app/dtos';
import { ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class MessageConnection extends GraphQLListResponse<MessageType> {
  constructor(messages: MessageType[], pagination: PaginationMetaDto) {
    super(messages, pagination);
  }
}

@InputType()
export class ConversationSearchInput extends GraphQLSearchPaginationInput {
  @Field({ nullable: true })
  participantId?: string;
}
```

**Using Domain Models:**
```typescript
import { UserId, MessageId, ConversationId } from '@app/domain';

export class Message {
  constructor(
    private readonly id: MessageId,
    private readonly conversationId: ConversationId,
    private readonly senderId: UserId,
    private readonly content: string,
    private readonly timestamp: Date,
  ) {}

  isFromUser(userId: UserId): boolean {
    return this.senderId.equals(userId);
  }
}
```

**Using GraphQL Subscriptions:**
```typescript
import { GraphQLSubscriptionService } from '@app/graphql';
import { Subscription, Args, Context } from '@nestjs/graphql';

@Resolver()
export class MessageResolver {
  constructor(
    private readonly subscriptionService: GraphQLSubscriptionService,
  ) {}

  @Subscription(() => MessageType)
  messageReceived(
    @Args('conversationId') conversationId: string,
    @Context() context: any,
  ) {
    return this.subscriptionService.createSubscription(
      'messageReceived',
      { conversationId },
      context,
    );
  }
}
```

**Using Security Authentication and Authorization:**
```typescript
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@app/security';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

@Resolver(() => MessageType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessageResolver {
  @Query(() => [MessageType])
  @Roles('user', 'admin')
  async messages(
    @Args('conversationId') conversationId: string,
    @Context() context: any,
  ) {
    // Only authenticated users with 'user' or 'admin' roles can access
    return this.messageService.getMessages(conversationId, context.user);
  }

  @Mutation(() => MessageType)
  @Roles('user')
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context: any,
  ) {
    // Only authenticated users with 'user' role can send messages
    return this.messageService.sendMessage(input, context.user);
  }

  @Query(() => [ConversationType])
  @Public() // Public endpoint, no authentication required
  async publicConversations() {
    return this.conversationService.getPublicConversations();
  }
}
```

**Using Security Guards in Controllers:**
```typescript
import { JwtAuthGuard, RolesGuard, Roles } from '@app/security';
import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  @Get('health')
  @Public() // Override global auth guard for health check
  getHealth() {
    return { status: 'ok' };
  }

  @Post('admin/cleanup')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async adminCleanup(@Request() req) {
    // Only admin users can access this endpoint
    return this.chatService.performCleanup(req.user);
  }
}
```

### External Dependencies
- **MongoDB**: Message and conversation storage
- **Redis**: Real-time data and caching
- **Kafka**: Event publishing for service communication
- **WebSocket**: Real-time communication

## Development

### Running the Service

```bash
# Development mode
pnpm run start:dev chat-service

# Production mode
pnpm run start:prod chat-service

# Debug mode
pnpm run start:debug chat-service
```

### Testing

The service uses the shared `@app/testing` module for consistent testing patterns.

#### Unit Tests

```bash
# Run all chat-service tests
pnpm test -- --testPathPattern=chat-service

# Run specific test file
pnpm test -- chat-service.controller.spec.ts

# Run tests with coverage
pnpm test -- --coverage --testPathPattern=chat-service
```

#### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e chat-service
```

#### Testing Patterns

**GraphQL Resolver Tests:**
```typescript
import { Test } from '@nestjs/testing';
import { MessageResolver } from './message.resolver';
import { MockFactoryService } from '@app/testing';

describe('MessageResolver', () => {
  let resolver: MessageResolver;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();

    const module = await Test.createTestingModule({
      providers: [
        MessageResolver,
        {
          provide: 'MessageQueryRepository',
          useValue: mockFactory.createMockMessageRepository(),
        },
        {
          provide: 'MessageCommandRepository',
          useValue: mockFactory.createMockMessageRepository(),
        },
      ],
    }).compile();

    resolver = module.get<MessageResolver>(MessageResolver);
  });

  it('should send message', async () => {
    const sendMessageInput = mockFactory.createMockSendMessageInput();
    const result = await resolver.sendMessage(sendMessageInput);
    expect(result).toBeDefined();
    expect(result.content).toBe(sendMessageInput.content);
  });

  it('should get conversation messages', async () => {
    const conversationId = mockFactory.createMockConversationId();
    const result = await resolver.messages(conversationId, { page: 1, limit: 10 });
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
  });
});
```

**GraphQL Subscription Tests:**
```typescript
import { Test } from '@nestjs/testing';
import { MessageResolver } from './message.resolver';
import { MockFactoryService, GraphQLTestBuilder } from '@app/testing';

describe('MessageResolver Subscriptions', () => {
  let resolver: MessageResolver;
  let mockFactory: MockFactoryService;
  let graphqlTestBuilder: GraphQLTestBuilder;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    graphqlTestBuilder = new GraphQLTestBuilder();

    const module = await Test.createTestingModule({
      providers: [
        MessageResolver,
        {
          provide: 'SubscriptionService',
          useValue: mockFactory.createMockSubscriptionService(),
        },
      ],
    }).compile();

    resolver = module.get<MessageResolver>(MessageResolver);
  });

  it('should create message subscription', async () => {
    const conversationId = mockFactory.createMockConversationId();
    const context = mockFactory.createMockGraphQLContext();

    const subscription = resolver.messageReceived(conversationId, context);
    expect(subscription).toBeDefined();
  });
});
```

**CQRS Command Tests:**
```typescript
import { Test } from '@nestjs/testing';
import { SendMessageCommand, SendMessageHandler } from './commands';
import { MockFactoryService } from '@app/testing';

describe('SendMessageHandler', () => {
  let handler: SendMessageHandler;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();

    const module = await Test.createTestingModule({
      providers: [
        SendMessageHandler,
        {
          provide: 'MessageRepository',
          useValue: mockFactory.createMockMessageRepository(),
        },
        {
          provide: 'EventBus',
          useValue: mockFactory.createMockEventBus(),
        },
      ],
    }).compile();

    handler = module.get<SendMessageHandler>(SendMessageHandler);
  });

  it('should send message', async () => {
    const command = new SendMessageCommand(
      'conv-123',
      'user-456',
      'Hello, world!',
    );
    const result = await handler.execute(command);
    expect(result).toBeDefined();
    expect(result.content).toBe('Hello, world!');
  });
});
```

**Service Tests:**
```typescript
import { ServiceTestBuilder, MockFactoryService } from '@app/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let testSetup: any;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const serviceTestBuilder = new ServiceTestBuilder(/* ... */);
    testSetup = await serviceTestBuilder.createServiceTestSetup(ChatService, {
      messageRepository: mockFactory.createMockMessageRepository(),
      conversationRepository: mockFactory.createMockConversationRepository(),
      eventBus: mockFactory.createMockEventBus(),
    });
  });

  it('should create conversation', async () => {
    const conversationData = mockFactory.createMockConversation();
    const result = await testSetup.service.createConversation(conversationData);
    expect(result).toBeDefined();
  });

  it('should handle message events', async () => {
    const messageEvent = mockFactory.createMockMessageEvent();
    await testSetup.service.handleMessageEvent(messageEvent);
    expect(testSetup.eventBus.publish).toHaveBeenCalled();
  });
});
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chat_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=chat-service

# WebSocket
WEBSOCKET_PORT=4003
WEBSOCKET_CORS_ORIGIN=http://localhost:3000

# Service
PORT=4003
NODE_ENV=development
```

## Migration Notes

### Standardization Changes

During the service standardization process, the Chat Service was updated to:

1. **Shared Module Integration**: Migrated to use shared infrastructure modules
2. **Validation Standardization**: Replaced custom validation with `@app/validation` decorators
3. **DTO Standardization**: Adopted shared DTO patterns from `@app/dtos`
4. **Testing Standardization**: Migrated to shared testing utilities from `@app/testing`
5. **Logging Integration**: Integrated with centralized logging from `@app/logging`
6. **Event Communication**: Standardized event handling using `@app/events` and `@app/kafka`

### Performance Optimizations

- **Caching Strategy**: Implemented Redis caching for frequently accessed conversations
- **Message Pagination**: Optimized message retrieval with cursor-based pagination
- **WebSocket Optimization**: Improved real-time message delivery performance
- **Database Indexing**: Added indexes for message search and conversation queries

## Deployment

### Docker

```bash
# Build image
docker build -t chat-service .

# Run container
docker run -p 4003:4003 chat-service
```

### Docker Compose

```bash
# Start all services
docker-compose up chat-service

# Start with dependencies
docker-compose up chat-service mongodb redis kafka
```

## Monitoring

### Health Checks

- **System Health**: Service status and resource usage
- **Database Health**: MongoDB connection and performance
- **Redis Health**: Cache connectivity and performance
- **Kafka Health**: Event system connectivity
- **WebSocket Health**: Real-time connection status

### Logging

Structured logging using `@app/logging`:

- **Message Logging**: Message send/receive events
- **Conversation Logging**: Conversation creation and management
- **WebSocket Logging**: Connection and disconnection events
- **Error Logging**: Detailed error information with context

### Metrics

Key performance indicators:

- **Message Throughput**: Messages sent/received per second
- **Conversation Activity**: Active conversations and participants
- **GraphQL Operations**: Query/mutation/subscription execution times
- **WebSocket Connections**: Real-time connection count
- **Response Times**: GraphQL endpoint and subscription response times

### Performance Monitoring

The Chat Service integrates with the comprehensive performance monitoring system:

#### Performance Baselines (Current)
- **Bundle Size**: 418.72 KB (59.13 KB gzipped)
- **Average Response Time**: <30ms for GraphQL queries, <10ms for subscriptions
- **Message Throughput**: 1000+ messages/second sustained
- **WebSocket Connections**: 500+ concurrent connections supported
- **Memory Usage**: ~22 MB average, no memory leaks detected
- **Build Time**: 3.8s average

#### Performance Tools Integration
```bash
# Run performance analysis specific to chat-service
pnpm perf:monitor --service=chat-service

# Analyze GraphQL performance
pnpm perf:graphql --service=chat-service

# Monitor WebSocket performance
pnpm perf:websocket --service=chat-service

# Analyze message throughput
pnpm perf:messaging --service=chat-service
```

#### Performance Optimizations Applied
- **GraphQL DataLoader**: Efficient batching for conversation and user queries
- **Subscription Optimization**: Optimized real-time message delivery
- **MongoDB Indexing**: Optimized indexes for message queries and conversation lookups
- **Redis Caching**: Multi-layer caching for conversations and user data
- **Connection Pooling**: Optimized WebSocket connection management

#### Real-time Performance Features
- **Message Batching**: Efficient batching of multiple messages
- **Subscription Filtering**: Server-side filtering to reduce client load
- **Connection Scaling**: Horizontal scaling support for WebSocket connections
- **Memory Management**: Efficient memory usage for large conversation histories

#### Monitoring Integration
- **External Monitoring**: PM2 for process management and performance monitoring
- **GraphQL Metrics**: Query complexity and execution time tracking via built-in GraphQL monitoring
- **WebSocket Metrics**: Connection count and message delivery tracking via WebSocket monitoring
- **Health Checks**: Built-in health endpoints for service status monitoring
- **Alerting**: Performance threshold monitoring via external tools
- **Dashboards**: Real-time performance visualization via PM2 and log aggregation

For detailed performance documentation, see [Performance Documentation Index](../../docs/server/performance/README.md).

## Security

### Centralized Security Integration

The Chat Service uses the centralized `@app/security` module for all authentication and authorization:

- **JWT Authentication**: Centralized JWT token validation using `JwtAuthGuard`
- **Role-Based Access Control**: Fine-grained permissions using `@Roles()` decorator
- **Public Endpoints**: Selective public access using `@Public()` decorator
- **GraphQL Security**: Integrated authentication for GraphQL resolvers and subscriptions

### Message Security

- **Conversation Access Control**: Users can only access conversations they participate in
- **Message Ownership**: Users can only modify/delete their own messages
- **Real-time Authorization**: WebSocket subscriptions validate user permissions
- **Message Encryption**: Optional end-to-end encryption support
- **Rate Limiting**: Message sending rate limits per user using `@app/security`

### WebSocket Security

- **Connection Authentication**: JWT token validation for WebSocket connections
- **Subscription Authorization**: Users can only subscribe to authorized conversation events
- **Room-Based Security**: Conversation-specific access control for real-time events
- **Message Validation**: All incoming messages validated before processing

### Security Integration Examples

```typescript
// GraphQL resolver with Security protection
@Resolver(() => ConversationType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConversationResolver {
  @Query(() => [ConversationType])
  @Roles('user')
  async myConversations(@Context() context: any) {
    // Automatically gets user from JWT token via Security module
    return this.conversationService.getUserConversations(context.user.id);
  }

  @Mutation(() => ConversationType)
  @Roles('user', 'moderator')
  async createConversation(
    @Args('input') input: CreateConversationInput,
    @Context() context: any,
  ) {
    // Role-based access: users and moderators can create conversations
    return this.conversationService.create(input, context.user);
  }
}

// WebSocket gateway with IAM integration
@WebSocketGateway()
export class ChatGateway {
  @UseGuards(WsJwtAuthGuard) // WebSocket-specific IAM guard
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // User context automatically injected by IAM
    const user = client.handshake.user;
    await this.chatService.joinConversation(data.conversationId, user);
  }
}
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection**: Check CORS configuration and authentication
2. **Message Delivery**: Verify Kafka connectivity and event handlers
3. **Database Performance**: Monitor MongoDB queries and indexing
4. **Cache Issues**: Check Redis connectivity and cache invalidation

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development pnpm run start:debug chat-service

# WebSocket debugging
WEBSOCKET_DEBUG=true pnpm run start:dev chat-service
```

## Contributing

1. Follow the established patterns from shared modules
2. Write comprehensive tests using `@app/testing` utilities
3. Update documentation for new features
4. Ensure WebSocket events are properly tested
5. Follow the service standardization guidelines

## Related Documentation

### Core Planning Documents
- [Chat Service Plan](../../docs/server/CHAT_SERVICE_PLAN.md)
- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)

### Architecture and Implementation Guides
- [DDD Implementation Guide](../../docs/server/DDD_IMPLEMENTATION_GUIDE.md)
- [CQRS Implementation Plan](../../docs/server/CQRS_IMPLEMENTATION_PLAN.md)
- [GraphQL Best Practices](../../docs/server/GRAPHQL_GUIDELINES.md)
- [WebSocket Implementation Guide](../../docs/server/WEBSOCKET_GUIDE.md)

### Standards and Guidelines
- [Testing Standards Guide](../../docs/server/TESTING_STANDARDS_GUIDE.md)
- [Validation Standards Guide](../../docs/server/VALIDATION_STANDARDS_GUIDE.md)
- [Security Standards Guide](../../docs/server/SECURITY_STANDARDS_GUIDE.md)

### Performance and Monitoring
- [Performance Documentation Index](../../docs/server/performance/README.md)
- [Performance Best Practices](../../docs/server/performance/PERFORMANCE_BEST_PRACTICES.md)

### Shared Module Documentation
- [Security Library](../../libs/security/README.md) - Identity and Access Management
- [Testing Library](../../libs/testing/README.md)
- [GraphQL Library](../../libs/graphql/README.md)
