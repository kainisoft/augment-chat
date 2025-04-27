# Chat Service Plan

## Overview
The Chat Service handles private messaging, group chats, message history, and real-time chat features.

## Technology Stack
- NestJS with Fastify
- MongoDB for message storage
- Kafka for inter-service communication
- WebSockets for real-time features

## Development Tasks

### Phase 1: Basic Setup
- [x] Initialize service with NestJS CLI
- [x] Configure Fastify adapter
- [ ] Set up MongoDB connection
- [ ] Create message and conversation schemas

### Phase 2: Core Features
- [ ] Implement private messaging
- [ ] Create message history functionality
- [ ] Develop basic group chat capability
- [ ] Add message delivery status
- [ ] Implement WebSocket connections

### Phase 3: Advanced Features
- [ ] Add read receipts
- [ ] Implement typing indicators
- [ ] Create file attachment support
- [ ] Add message reactions
- [ ] Implement message threading
- [ ] Create message search functionality

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

## API Endpoints

### Messages
- `GET /conversations/:id/messages` - Get messages in conversation
- `POST /conversations/:id/messages` - Send new message
- `PATCH /conversations/:id/messages/:messageId` - Update message
- `DELETE /conversations/:id/messages/:messageId` - Delete message

### Conversations
- `GET /conversations` - Get user conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/:id` - Get conversation details
- `PATCH /conversations/:id` - Update conversation
- `DELETE /conversations/:id` - Delete conversation

### Real-time Features
- `WebSocket /chat` - Real-time chat connection
- `Event: typing` - Typing indicator events
- `Event: read` - Read receipt events

### Health Checks
- `GET /health` - Service health check endpoint
