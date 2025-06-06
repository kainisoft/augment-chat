# Chat Service GraphQL API

## Overview

The Chat Service GraphQL API provides a comprehensive interface for managing conversations, messages, and real-time chat features. It follows GraphQL best practices and implements standardized patterns for error handling, logging, and validation.

## Features

- **Message Management**: Send, update, delete, and query messages
- **Conversation Management**: Create, update, delete, and manage conversations
- **Real-time Features**: WebSocket subscriptions for live messaging
- **File Attachments**: Support for file sharing in conversations
- **Message Reactions**: Emoji reactions and interaction tracking
- **Comprehensive Error Handling**: Standardized error responses with detailed context
- **Structured Logging**: All operations are logged with contextual information
- **Type Safety**: Full TypeScript support with generated types

## Directory Structure

- `graphql.module.ts` - Main GraphQL module configuration
- `resolvers/` - GraphQL resolvers for different entities
- `types/` - GraphQL type definitions and input types
- `generated/` - Generated GraphQL schema and TypeScript types

## Code Generation

We use GraphQL Code Generator to generate TypeScript types from our GraphQL schema. This ensures type safety between our GraphQL schema and TypeScript code.

### Generated Files

- `generated/schema.gql` - The GraphQL schema generated from NestJS decorators
- `generated/graphql.ts` - TypeScript types for resolvers and schema

### How to Generate Types

Run the following command from the root directory:

```bash
pnpm graphql:generate:chat
```

This will generate TypeScript types based on the GraphQL schema.

To watch for changes and regenerate types automatically:

```bash
pnpm graphql:watch:chat
```

## Schema Overview

### Core Types

#### MessageType
Represents a message in a conversation.

```graphql
type MessageType {
  id: ID!
  conversationId: ID!
  senderId: String!
  content: String!
  attachments: [MessageAttachmentType!]
  createdAt: DateTime!
  updatedAt: DateTime!
  deliveredTo: [String!]
  readBy: [String!]
  editHistory: [MessageEditHistoryType!]
  reactions: [MessageReactionType!]
  replyTo: ID
  messageType: MessageType!
}
```

#### ConversationType
Represents a conversation (private or group chat).

```graphql
type ConversationType {
  id: ID!
  type: ConversationType!
  participants: [String!]!
  name: String
  description: String
  avatar: String
  createdAt: DateTime!
  updatedAt: DateTime!
  lastMessageAt: DateTime
  lastMessageId: ID
  settings: ConversationSettingsType
  lastMessage: MessageType
  unreadCount: Int!
  messageCount: Int!
}
```

## API Operations

### Queries

#### Get Message
```graphql
query GetMessage($id: ID!) {
  message(id: $id) {
    id
    content
    senderId
    createdAt
    messageType
  }
}
```

#### Get Messages
```graphql
query GetMessages($conversationId: ID!, $limit: Int, $offset: Int) {
  messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
    items {
      id
      content
      senderId
      createdAt
      messageType
    }
    totalCount
    hasMore
  }
}
```

#### Get Conversations
```graphql
query GetConversations($limit: Int, $offset: Int) {
  conversations(limit: $limit, offset: $offset) {
    items {
      id
      type
      participants
      name
      lastMessage {
        content
        createdAt
      }
      unreadCount
    }
    totalCount
    hasMore
  }
}
```

### Mutations

#### Send Message
```graphql
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    senderId
    conversationId
    createdAt
    messageType
  }
}
```

#### Create Conversation
```graphql
mutation CreateConversation($input: CreateConversationInput!) {
  createConversation(input: $input) {
    id
    type
    participants
    name
    createdAt
  }
}
```

#### Update Message
```graphql
mutation UpdateMessage($messageId: ID!, $input: UpdateMessageInput!) {
  updateMessage(messageId: $messageId, input: $input) {
    id
    content
    updatedAt
    editHistory {
      content
      editedAt
      editedBy
    }
  }
}
```

### Subscriptions (Future Implementation)

#### Message Received
```graphql
subscription MessageReceived($conversationId: ID!) {
  messageReceived(conversationId: $conversationId) {
    id
    content
    senderId
    createdAt
    messageType
  }
}
```

#### Typing Status
```graphql
subscription TypingStatus($conversationId: ID!) {
  typingStatus(conversationId: $conversationId) {
    userId
    isTyping
    timestamp
  }
}
```

## Development Guidelines

1. **Always run code generation** after making changes to GraphQL schema
2. **Use the generated types** in your resolvers and services
3. **Keep the GraphQL schema and TypeScript types in sync**
4. **Use the `@Resolver()` decorator** with the correct type
5. **Implement comprehensive error handling** in all resolvers
6. **Add detailed JSDoc comments** to all resolver methods
7. **Use structured logging** for all operations
8. **Validate inputs** before processing
9. **Follow consistent naming conventions** for queries and mutations
10. **Test all GraphQL operations** thoroughly

## Integration with Apollo Federation

The Chat Service GraphQL schema is designed to work with Apollo Federation, allowing it to be composed with other microservices (like User Service) into a unified GraphQL gateway.

Key federation features:
- `@key` directives for entity resolution
- Proper entity references for cross-service relationships
- Consistent field naming and types across services

## Related Documentation

- [Chat Service Plan](../../../docs/server/CHAT_SERVICE_PLAN.md)
- [GraphQL Enhancements Summary](../../../docs/server/GRAPHQL_ENHANCEMENTS_SUMMARY.md)
- [User Service GraphQL API](../../user-service/src/graphql/README.md)
