# Domain-Driven Design (DDD) Implementation Guide

## Overview

This guide outlines how to implement Domain-Driven Design (DDD) principles in our chat application's microservices architecture. DDD is an approach to software development that focuses on creating a rich domain model that reflects the business domain, using a ubiquitous language shared by both technical and non-technical stakeholders.

## Core DDD Concepts

### 1. Ubiquitous Language

A shared language between developers and domain experts that is used consistently in code, documentation, and conversation.

**Implementation:**
- Create a glossary of domain terms in each microservice
- Use these terms consistently in code (class names, method names, variables)
- Document the ubiquitous language in service READMEs

### 2. Bounded Contexts

Explicit boundaries within which a particular domain model applies. Each microservice in our architecture represents a bounded context.

**Our Bounded Contexts:**
- **User Context** (User Service): User profiles, relationships, settings
- **Authentication Context** (Auth Service): Registration, login, tokens
- **Chat Context** (Chat Service): Messages, conversations, attachments
- **Notification Context** (Notification Service): Alerts, preferences
- **API Context** (API Gateway): Client communication, request routing

### 3. Strategic Design

#### Context Mapping
Define relationships between bounded contexts:
- **Partnership**: User Service ↔ Auth Service
- **Customer/Supplier**: Chat Service → User Service
- **Conformist**: Notification Service → User Service
- **Anti-corruption Layer**: API Gateway → All Services

## Tactical Design Patterns

### 1. Layered Architecture

Each microservice should follow this layered architecture:

```
┌─────────────────────────────────────────┐
│ Presentation Layer                      │
│ (Controllers, Resolvers, API Endpoints) │
├─────────────────────────────────────────┤
│ Application Layer                       │
│ (Use Cases, Application Services)       │
├─────────────────────────────────────────┤
│ Domain Layer                            │
│ (Entities, Value Objects, Aggregates)   │
├─────────────────────────────────────────┤
│ Infrastructure Layer                    │
│ (Repositories, External Services)       │
└─────────────────────────────────────────┘
```

### 2. Domain Layer Components

#### Entities
Objects with identity that persists over time.

Example in User Service:
```typescript
// Domain Layer: User Entity
export class User {
  private readonly id: UserId;
  private email: Email;
  private username: Username;
  private password: Password;
  private profile: UserProfile;
  private status: UserStatus;

  constructor(props: UserProps) {
    this.id = props.id || new UserId();
    this.email = props.email;
    this.username = props.username;
    this.password = props.password;
    this.profile = props.profile;
    this.status = props.status || UserStatus.OFFLINE;
  }

  // Domain methods with business logic
  updateProfile(profile: UserProfile): void {
    this.profile = profile;
  }

  changeStatus(status: UserStatus): void {
    this.status = status;
  }

  // Getters
  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  // Other methods...
}
```

#### Value Objects
Immutable objects without identity, defined by their attributes.

Example:
```typescript
// Domain Layer: Email Value Object
export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validateEmail(email);
    this.value = email;
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailError(email);
    }
  }

  equals(email: Email): boolean {
    return this.value === email.value;
  }

  toString(): string {
    return this.value;
  }
}
```

#### Aggregates
Cluster of domain objects treated as a single unit, with a root entity.

Example in Chat Service:
```typescript
// Domain Layer: Conversation Aggregate
export class Conversation {
  private readonly id: ConversationId;
  private participants: UserId[];
  private messages: Message[];
  private type: ConversationType;
  private metadata: ConversationMetadata;

  constructor(props: ConversationProps) {
    this.id = props.id || new ConversationId();
    this.participants = props.participants;
    this.messages = props.messages || [];
    this.type = props.type;
    this.metadata = props.metadata;
  }

  // Domain methods
  addMessage(message: Message): void {
    this.validateMessageSender(message);
    this.messages.push(message);
  }

  private validateMessageSender(message: Message): void {
    if (!this.participants.some(id => id.equals(message.getSenderId()))) {
      throw new InvalidSenderError();
    }
  }

  addParticipant(userId: UserId): void {
    if (this.participants.some(id => id.equals(userId))) {
      return; // Already a participant
    }
    this.participants.push(userId);
  }

  // Other methods...
}
```

#### Domain Services
Operations that don't naturally belong to any entity or value object.

Example:
```typescript
// Domain Layer: Friend Request Service
export class FriendRequestService {
  canSendFriendRequest(sender: User, recipient: User): boolean {
    // Domain logic for determining if a friend request can be sent
    if (sender.getId().equals(recipient.getId())) {
      return false; // Can't send friend request to self
    }

    if (sender.isFriendsWith(recipient)) {
      return false; // Already friends
    }

    if (sender.hasPendingRequestTo(recipient)) {
      return false; // Already sent a request
    }

    return true;
  }
}
```

#### Domain Events
Something significant that happened in the domain.

Example:
```typescript
// Domain Layer: Message Sent Event
export class MessageSentEvent implements DomainEvent {
  constructor(
    public readonly messageId: MessageId,
    public readonly conversationId: ConversationId,
    public readonly senderId: UserId,
    public readonly timestamp: Date,
  ) {}
}
```

### 3. Application Layer Components

#### Application Services
Orchestrate the execution of domain logic and manage transactions.

Example:
```typescript
// Application Layer: Send Message Use Case
@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: SendMessageCommand): Promise<MessageDto> {
    // Get the conversation
    const conversation = await this.conversationRepository.findById(command.conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(command.conversationId);
    }

    // Create the message
    const message = new Message({
      content: new MessageContent(command.content),
      senderId: new UserId(command.senderId),
      type: MessageType.TEXT,
    });

    // Add message to conversation (domain logic happens here)
    conversation.addMessage(message);

    // Save the updated conversation
    await this.conversationRepository.save(conversation);

    // Publish domain event
    this.eventPublisher.publish(
      new MessageSentEvent(
        message.getId(),
        conversation.getId(),
        message.getSenderId(),
        message.getCreatedAt(),
      ),
    );

    // Return DTO
    return MessageMapper.toDto(message);
  }
}
```

### 4. Infrastructure Layer Components

#### Repositories
Provide methods to retrieve and store domain objects.

Example:
```typescript
// Infrastructure Layer: MongoDB Conversation Repository
@Injectable()
export class MongoConversationRepository implements ConversationRepository {
  constructor(
    @InjectModel(ConversationSchema.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findById(id: ConversationId): Promise<Conversation | null> {
    const conversationDoc = await this.conversationModel.findOne({ 
      _id: id.toString() 
    }).exec();
    
    if (!conversationDoc) {
      return null;
    }
    
    return this.toDomain(conversationDoc);
  }

  async save(conversation: Conversation): Promise<void> {
    const conversationData = this.toPersistence(conversation);
    
    await this.conversationModel.findOneAndUpdate(
      { _id: conversation.getId().toString() },
      conversationData,
      { upsert: true, new: true }
    );
  }

  private toDomain(document: ConversationDocument): Conversation {
    // Map from persistence model to domain model
    // ...
  }

  private toPersistence(conversation: Conversation): any {
    // Map from domain model to persistence model
    // ...
  }
}
```

### 5. Presentation Layer Components

#### Controllers/Resolvers
Handle HTTP requests or GraphQL operations.

Example:
```typescript
// Presentation Layer: GraphQL Resolver
@Resolver(() => MessageType)
export class MessageResolver {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @Mutation(() => MessageType)
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @CurrentUser() user: UserDto,
  ): Promise<MessageType> {
    const command = new SendMessageCommand({
      conversationId: input.conversationId,
      content: input.content,
      senderId: user.id,
    });

    return this.sendMessageUseCase.execute(command);
  }
}
```

## Advanced DDD Patterns

### 1. CQRS (Command Query Responsibility Segregation)

Separate read and write operations for more complex domains.

Implementation:
- **Commands**: Modify state (e.g., SendMessageCommand)
- **Queries**: Return data without modification (e.g., GetConversationQuery)
- **Command Handlers**: Process commands and update the write model
- **Query Handlers**: Process queries against the read model

### 2. Event Sourcing

Store state changes as a sequence of events.

Implementation:
- Event Store for persisting domain events
- Ability to reconstruct domain state by replaying events
- Event handlers for updating read models

## Implementation Strategy

### Phase 1: Refactor Existing Services
1. Identify domain concepts and establish ubiquitous language
2. Create value objects for primitive obsession
3. Implement entities with proper encapsulation
4. Refactor repositories to work with domain objects

### Phase 2: Implement Advanced Patterns
1. Introduce aggregates and enforce invariants
2. Implement domain events and event handlers
3. Add CQRS for complex operations
4. Consider event sourcing for critical data

### Phase 3: Continuous Refinement
1. Regular domain modeling sessions with stakeholders
2. Refine the ubiquitous language
3. Adjust bounded contexts as needed
4. Improve domain model based on new insights

## Example Directory Structure

```
apps/user-service/
├── src/
│   ├── domain/                 # Domain Layer
│   │   ├── models/             # Entities, Value Objects, Aggregates
│   │   │   ├── user.entity.ts
│   │   │   ├── email.value-object.ts
│   │   │   └── ...
│   │   ├── events/             # Domain Events
│   │   │   ├── user-created.event.ts
│   │   │   └── ...
│   │   └── services/           # Domain Services
│   │       └── friend-request.service.ts
│   ├── application/            # Application Layer
│   │   ├── commands/           # Commands and Command Handlers
│   │   │   ├── create-user.command.ts
│   │   │   ├── create-user.handler.ts
│   │   │   └── ...
│   │   ├── queries/            # Queries and Query Handlers
│   │   │   ├── get-user.query.ts
│   │   │   ├── get-user.handler.ts
│   │   │   └── ...
│   │   ├── dtos/               # Data Transfer Objects
│   │   │   ├── user.dto.ts
│   │   │   └── ...
│   │   └── services/           # Application Services
│   │       ├── user.service.ts
│   │       └── ...
│   ├── infrastructure/         # Infrastructure Layer
│   │   ├── persistence/        # Database Adapters
│   │   │   ├── repositories/
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── ...
│   │   │   ├── schemas/
│   │   │   │   ├── user.schema.ts
│   │   │   │   └── ...
│   │   │   └── mappers/
│   │   │       ├── user.mapper.ts
│   │   │       └── ...
│   │   ├── messaging/          # Kafka Producers/Consumers
│   │   │   ├── producers/
│   │   │   └── consumers/
│   │   └── config/             # Infrastructure Configuration
│   │       └── database.config.ts
│   └── presentation/           # Presentation Layer
│       ├── controllers/        # REST Controllers
│       │   └── user.controller.ts
│       ├── resolvers/          # GraphQL Resolvers
│       │   └── user.resolver.ts
│       └── dtos/               # Request/Response DTOs
│           ├── create-user.request.dto.ts
│           └── ...
└── test/                       # Tests
    ├── unit/                   # Unit Tests
    │   ├── domain/
    │   ├── application/
    │   └── ...
    └── integration/            # Integration Tests
```

## Resources

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215) by Eric Evans
- [Implementing Domain-Driven Design](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577) by Vaughn Vernon
- [Domain-Driven Design Distilled](https://www.amazon.com/Domain-Driven-Design-Distilled-Vaughn-Vernon/dp/0134434420) by Vaughn Vernon
