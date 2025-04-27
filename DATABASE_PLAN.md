# Database Plan

## Overview
This document outlines the database architecture for the chat application, including schema design, relationships, and implementation details.

## Database Technologies

### PostgreSQL
Used for structured data with relationships:
- User accounts and profiles
- Authentication data
- User relationships
- User settings and preferences

### MongoDB
Used for unstructured and high-volume data:
- Chat messages
- Conversations
- Notifications
- File attachment metadata

### Redis (Optional)
Used for caching and ephemeral data:
- Session management
- Real-time presence data
- Rate limiting
- Temporary data caching

## PostgreSQL Schema

### Users Table
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE NOT NULL
- `username` VARCHAR(50) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `last_login_at` TIMESTAMP
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `is_verified` BOOLEAN NOT NULL DEFAULT FALSE

### Profiles Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `display_name` VARCHAR(100)
- `bio` TEXT
- `avatar_url` VARCHAR(255)
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()

### Relationships Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `related_user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `type` VARCHAR(20) NOT NULL (friend, blocked, etc.)
- `status` VARCHAR(20) NOT NULL (pending, accepted, rejected)
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
- UNIQUE(user_id, related_user_id)

### Settings Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `key` VARCHAR(50) NOT NULL
- `value` JSONB NOT NULL
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
- UNIQUE(user_id, key)

### RefreshTokens Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `token` VARCHAR(255) NOT NULL
- `expires_at` TIMESTAMP NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `revoked` BOOLEAN NOT NULL DEFAULT FALSE
- `revoked_at` TIMESTAMP

## MongoDB Collections

### Messages Collection
```javascript
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender_id: String, // UUID from PostgreSQL
  content: String,
  attachments: [
    {
      id: ObjectId,
      type: String,
      url: String,
      name: String,
      size: Number
    }
  ],
  created_at: Date,
  updated_at: Date,
  delivered_to: [
    {
      user_id: String, // UUID from PostgreSQL
      timestamp: Date
    }
  ],
  read_by: [
    {
      user_id: String, // UUID from PostgreSQL
      timestamp: Date
    }
  ]
}
```

### Conversations Collection
```javascript
{
  _id: ObjectId,
  type: String, // "private" or "group"
  participants: [String], // UUIDs from PostgreSQL
  name: String, // for group chats
  created_by: String, // UUID from PostgreSQL
  created_at: Date,
  updated_at: Date,
  last_message_at: Date,
  last_message_preview: String,
  is_active: Boolean
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  user_id: String, // UUID from PostgreSQL
  type: String,
  content: Object,
  related_to: {
    type: String, // "message", "friend_request", etc.
    id: String // ID of the related entity
  },
  is_read: Boolean,
  created_at: Date,
  expires_at: Date
}
```

### NotificationPreferences Collection
```javascript
{
  _id: ObjectId,
  user_id: String, // UUID from PostgreSQL
  channels: {
    in_app: Boolean,
    email: Boolean,
    push: Boolean
  },
  types: {
    message: Boolean,
    friend_request: Boolean,
    system: Boolean
    // other notification types
  },
  updated_at: Date
}
```

## Implementation Tasks

### PostgreSQL Setup
- [ ] Create database initialization scripts
- [ ] Set up migrations system
- [ ] Implement entity models in NestJS
- [ ] Configure connection pooling
- [ ] Set up indexes for performance
- [ ] Implement data validation

### MongoDB Setup
- [ ] Create database initialization scripts
- [ ] Define schema validation rules
- [ ] Implement repository patterns in NestJS
- [ ] Configure connection settings
- [ ] Set up indexes for performance
- [ ] Implement data validation

### Redis Setup (Optional)
- [ ] Configure Redis instance
- [ ] Set up key expiration policies
- [ ] Implement caching strategies
- [ ] Configure persistence options

## Database Security
- [ ] Implement row-level security in PostgreSQL
- [ ] Set up database users with least privilege
- [ ] Configure network security for database access
- [ ] Implement data encryption for sensitive fields
- [ ] Set up regular backup procedures
