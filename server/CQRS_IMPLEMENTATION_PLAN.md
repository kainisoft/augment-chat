# CQRS Implementation Plan

## Overview

This document outlines the implementation plan for Command Query Responsibility Segregation (CQRS) in our chat application microservices. CQRS separates read and write operations, allowing each to be optimized independently.

## Core CQRS Components

### 1. Commands

Commands represent intentions to change the system state. They are named with imperative verbs and should be processed exactly once.

**Examples:**
- `CreateUserCommand`
- `SendMessageCommand`
- `UpdateUserProfileCommand`
- `CreateConversationCommand`

### 2. Command Handlers

Command handlers contain the business logic to process commands and update the write model.

**Example:**
```typescript
@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SendMessageCommand): Promise<void> {
    // Get the aggregate
    const conversation = await this.conversationRepository.findById(command.conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(command.conversationId);
    }

    // Apply domain logic
    const message = new Message({
      content: new MessageContent(command.content),
      senderId: new UserId(command.senderId),
      type: MessageType.TEXT,
    });

    conversation.addMessage(message);

    // Save changes
    await this.conversationRepository.save(conversation);

    // Publish events
    this.eventBus.publish(new MessageSentEvent(message, conversation.getId()));
  }
}
```

### 3. Queries

Queries represent requests for information without changing state. They should be idempotent and can be executed multiple times without side effects.

**Examples:**
- `GetUserProfileQuery`
- `GetConversationMessagesQuery`
- `SearchUsersQuery`
- `GetUnreadMessagesCountQuery`

### 4. Query Handlers

Query handlers retrieve and format data from the read model.

**Example:**
```typescript
@QueryHandler(GetConversationMessagesQuery)
export class GetConversationMessagesHandler implements IQueryHandler<GetConversationMessagesQuery, MessageDto[]> {
  constructor(
    private readonly messageReadRepository: MessageReadRepository,
  ) {}

  async execute(query: GetConversationMessagesQuery): Promise<MessageDto[]> {
    const { conversationId, limit, offset } = query;

    // Retrieve from read model (optimized for queries)
    const messages = await this.messageReadRepository.findByConversationId(
      conversationId,
      { limit, offset, sortBy: 'createdAt', sortOrder: 'DESC' }
    );

    // Map to DTOs
    return messages.map(message => MessageMapper.toDto(message));
  }
}
```

### 5. Events

Events represent facts that have occurred in the system. They are used to update read models and trigger side effects.

**Examples:**
- `UserCreatedEvent`
- `MessageSentEvent`
- `ConversationCreatedEvent`
- `UserStatusChangedEvent`

### 6. Event Handlers

Event handlers update read models and trigger side effects based on events.

**Example:**
```typescript
@EventsHandler(MessageSentEvent)
export class MessageSentHandler implements IEventHandler<MessageSentEvent> {
  constructor(
    private readonly messageReadRepository: MessageReadRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async handle(event: MessageSentEvent): Promise<void> {
    // Update read model
    await this.messageReadRepository.create({
      id: event.message.getId().toString(),
      conversationId: event.conversationId.toString(),
      senderId: event.message.getSenderId().toString(),
      content: event.message.getContent().toString(),
      createdAt: event.message.getCreatedAt(),
    });

    // Trigger side effects (notifications)
    await this.notificationService.notifyNewMessage(event);
  }
}
```

## Implementation Strategy by Microservice

### 1. User Service

#### Commands:
- `CreateUserCommand`
- `UpdateUserProfileCommand`
- `ChangeUserStatusCommand`
- `AddUserContactCommand`
- `RemoveUserContactCommand`

#### Queries:
- `GetUserProfileQuery`
- `SearchUsersQuery`
- `GetUserContactsQuery`
- `GetUserByIdQuery`
- `GetUserByEmailQuery`

#### Events:
- `UserCreatedEvent`
- `UserProfileUpdatedEvent`
- `UserStatusChangedEvent`
- `UserContactAddedEvent`
- `UserContactRemovedEvent`

### 2. Auth Service

#### Commands:
- `RegisterUserCommand`
- `LoginUserCommand`
- `LogoutUserCommand`
- `RefreshTokenCommand`
- `ResetPasswordCommand`

#### Queries:
- `ValidateTokenQuery`
- `GetUserAuthInfoQuery`

#### Events:
- `UserRegisteredEvent`
- `UserLoggedInEvent`
- `UserLoggedOutEvent`
- `PasswordResetRequestedEvent`
- `PasswordChangedEvent`

### 3. Chat Service

#### Commands:
- `CreateConversationCommand`
- `SendMessageCommand`
- `DeleteMessageCommand`
- `AddParticipantCommand`
- `RemoveParticipantCommand`
- `MarkMessagesAsReadCommand`

#### Queries:
- `GetConversationsQuery`
- `GetConversationMessagesQuery`
- `GetUnreadMessagesCountQuery`
- `SearchMessagesQuery`

#### Events:
- `ConversationCreatedEvent`
- `MessageSentEvent`
- `MessageDeletedEvent`
- `ParticipantAddedEvent`
- `ParticipantRemovedEvent`
- `MessagesReadEvent`

### 4. Notification Service

#### Commands:
- `CreateNotificationCommand`
- `MarkNotificationAsReadCommand`
- `UpdateNotificationPreferencesCommand`

#### Queries:
- `GetUserNotificationsQuery`
- `GetUnreadNotificationsCountQuery`
- `GetNotificationPreferencesQuery`

#### Events:
- `NotificationCreatedEvent`
- `NotificationReadEvent`
- `NotificationPreferencesUpdatedEvent`

## Technical Implementation

### 1. NestJS CQRS Module

We'll use the `@nestjs/cqrs` package which provides a lightweight CQRS implementation:

```bash
pnpm add @nestjs/cqrs
```

### 2. Module Configuration

Each microservice will have a CQRS module configuration:

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Import command handlers
import { SendMessageHandler } from './commands/handlers/send-message.handler';
// ... other command handlers

// Import query handlers
import { GetConversationMessagesHandler } from './queries/handlers/get-conversation-messages.handler';
// ... other query handlers

// Import event handlers
import { MessageSentHandler } from './events/handlers/message-sent.handler';
// ... other event handlers

const CommandHandlers = [SendMessageHandler, /* ... */];
const QueryHandlers = [GetConversationMessagesHandler, /* ... */];
const EventHandlers = [MessageSentHandler, /* ... */];

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [CqrsModule],
})
export class ChatCqrsModule {}
```

### 3. Read/Write Model Separation

For each domain entity, we'll create separate read and write models:

```typescript
// Write model (domain entity)
export class Conversation {
  private readonly id: ConversationId;
  private participants: UserId[];
  private messages: Message[];
  // ... other properties and methods
}

// Read model (optimized for queries)
export interface ConversationReadModel {
  id: string;
  participants: string[];
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: number;
  updatedAt: Date;
  createdAt: Date;
}
```

### 4. Repository Separation

Separate repositories for read and write operations:

```typescript
// Write repository (domain repository)
export interface ConversationRepository {
  findById(id: ConversationId): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
  // ... other methods
}

// Read repository (query repository)
export interface ConversationReadRepository {
  findById(id: string): Promise<ConversationReadModel | null>;
  findByParticipantId(participantId: string, options?: QueryOptions): Promise<ConversationReadModel[]>;
  // ... other methods
}
```

## Implementation Phases

### Phase 1: Basic CQRS Structure
- Set up CQRS module in each microservice
- Define core commands, queries, and events
- Implement basic command and query handlers
- Set up event bus for internal events

### Phase 2: Read/Write Model Separation
- Create separate read and write models
- Implement read and write repositories
- Update handlers to use appropriate repositories
- Implement event handlers to update read models

### Phase 3: Advanced Features
- Implement event sourcing for critical aggregates
- Add distributed event handling with Kafka
- Implement eventual consistency patterns
- Add optimistic concurrency control

### Phase 4: Reduce Code Duplication
- Create abstract base repository classes
- Refactor repositories to use inheritance
- Maintain CQRS separation while sharing common code

## Example: User Service CQRS Implementation

### Directory Structure
```
apps/user-service/
├── src/
│   ├── application/
│   │   ├── commands/
│   │   │   ├── impl/
│   │   │   │   ├── create-user.command.ts
│   │   │   │   ├── update-user-profile.command.ts
│   │   │   │   └── ...
│   │   │   └── handlers/
│   │   │       ├── create-user.handler.ts
│   │   │       ├── update-user-profile.handler.ts
│   │   │       └── ...
│   │   ├── queries/
│   │   │   ├── impl/
│   │   │   │   ├── get-user-profile.query.ts
│   │   │   │   ├── search-users.query.ts
│   │   │   │   └── ...
│   │   │   └── handlers/
│   │   │       ├── get-user-profile.handler.ts
│   │   │       ├── search-users.handler.ts
│   │   │       └── ...
│   │   └── events/
│   │       ├── impl/
│   │       │   ├── user-created.event.ts
│   │       │   ├── user-profile-updated.event.ts
│   │       │   └── ...
│   │       └── handlers/
│   │           ├── user-created.handler.ts
│   │           ├── user-profile-updated.handler.ts
│   │           └── ...
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── write/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── user.repository.ts
│   │   │   │   └── schemas/
│   │   │   │       └── user.schema.ts
│   │   │   └── read/
│   │   │       ├── repositories/
│   │   │       │   └── user-read.repository.ts
│   │   │       └── schemas/
│   │   │           └── user-read.schema.ts
│   │   └── messaging/
│   │       ├── kafka-event-publisher.ts
│   │       └── kafka-event-consumer.ts
│   └── user-cqrs.module.ts
```

## Abstract Base Repository Pattern

To reduce code duplication while maintaining the benefits of CQRS, we'll implement an abstract base repository pattern:

### 1. Generic Base Repository

```typescript
// Base repository with shared functionality
export abstract class BaseRepository<T, TId, TDto = any> {
  // Common methods for both read and write repositories
  abstract findById(id: TId): Promise<T | null>;
  abstract exists(id: TId): Promise<boolean>;
  abstract count(filter?: any): Promise<number>;
}
```

### 2. Specialized Base Repositories

```typescript
// Write repository base class
export abstract class BaseWriteRepository<T, TId> extends BaseRepository<T, TId> {
  abstract save(entity: T): Promise<void>;
  abstract delete(id: TId): Promise<void>;
}

// Read repository base class
export abstract class BaseReadRepository<TDto, TId> extends BaseRepository<TDto, TId, TDto> {
  abstract findAll(options?: QueryOptions): Promise<TDto[]>;
  abstract search(term: string, options?: QueryOptions): Promise<TDto[]>;
}
```

### 3. Abstract Database Implementation

```typescript
// Abstract Drizzle implementation for write repositories
export abstract class AbstractDrizzleWriteRepository<T, TId, TSchema>
  implements BaseWriteRepository<T, TId> {

  constructor(
    protected readonly drizzle: DrizzleService,
    protected readonly table: any,
    protected readonly idField: any
  ) {}

  async findById(id: TId): Promise<T | null> {
    const idValue = this.getIdValue(id);
    const result = await this.drizzle.db
      .select()
      .from(this.table)
      .where(eq(this.idField, idValue))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  async exists(id: TId): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(filter?: any): Promise<number> {
    // Implementation...
    return 0;
  }

  async save(entity: T): Promise<void> {
    const data = this.toPersistence(entity);
    const idValue = this.getIdValue(this.getEntityId(entity));

    await this.drizzle.db
      .insert(this.table)
      .values(data)
      .onConflictDoUpdate({
        target: this.idField,
        set: data,
      });
  }

  async delete(id: TId): Promise<void> {
    const idValue = this.getIdValue(id);

    await this.drizzle.db
      .delete(this.table)
      .where(eq(this.idField, idValue));
  }

  // Abstract methods to be implemented by concrete classes
  protected abstract toDomain(data: any): T;
  protected abstract toPersistence(entity: T): any;
  protected abstract getIdValue(id: TId): any;
  protected abstract getEntityId(entity: T): TId;
}

// Abstract Drizzle implementation for read repositories
export abstract class AbstractDrizzleReadRepository<TDto, TId, TSchema>
  implements BaseReadRepository<TDto, TId> {

  constructor(
    protected readonly drizzle: DrizzleService,
    protected readonly table: any,
    protected readonly idField: any
  ) {}

  // Implementation of base methods...

  // Abstract methods to be implemented by concrete classes
  protected abstract toDto(data: any): TDto;
  protected abstract getIdValue(id: TId): any;
}
```

### 4. Concrete Repository Implementation

```typescript
// Concrete write repository
@Injectable()
export class DrizzleUserRepository
  extends AbstractDrizzleWriteRepository<User, UserId, typeof users>
  implements UserRepository {

  constructor(drizzle: DrizzleService) {
    super(drizzle, users, users.id);
  }

  // Implement domain-specific methods
  async findByEmail(email: Email): Promise<User | null> {
    // Implementation...
    return null;
  }

  // Implement abstract methods
  protected toDomain(data: any): User {
    return new User({
      id: new UserId(data.id),
      email: new Email(data.email),
      // Other properties...
    });
  }

  protected toPersistence(entity: User): any {
    return {
      id: entity.getId().toString(),
      email: entity.getEmail().toString(),
      // Other properties...
    };
  }

  protected getIdValue(id: UserId): string {
    return id.toString();
  }

  protected getEntityId(entity: User): UserId {
    return entity.getId();
  }
}
```

### 5. Benefits of Abstract Base Repositories

- **Reduced Duplication**: Common code is defined once in abstract classes
- **Type Safety**: Generic type parameters ensure type safety across the inheritance chain
- **Consistency**: Enforces consistent patterns across different repositories
- **Extensibility**: Easy to add new repository types or database implementations
- **Maintainability**: Changes to common functionality only need to be made in one place

## Benefits of This Approach

1. **Scalability**: Read and write operations can be scaled independently
2. **Performance**: Read models can be optimized for specific query patterns
3. **Maintainability**: Simpler code with clear separation of concerns
4. **Flexibility**: Easier to adapt to changing requirements
5. **Resilience**: Better fault isolation between read and write operations
6. **Code Reuse**: Abstract base classes reduce duplication while preserving separation

## Conclusion

Implementing CQRS in our chat application will provide significant benefits in terms of scalability, performance, and maintainability. By following this implementation plan, we can gradually introduce CQRS patterns into our microservices architecture while maintaining compatibility with existing code.
