import { ObjectId } from 'mongodb';

/**
 * MongoDB Schema Definitions for Chat Service
 *
 * Following Drizzle-like patterns for consistency with our PostgreSQL services.
 * These schemas define the structure and types for MongoDB collections.
 */

/**
 * Message Schema Definition
 *
 * Represents a message in a conversation.
 */
export const messageSchema = {
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: String,
  content: String,
  attachments: Array,
  createdAt: Date,
  updatedAt: Date,
  deliveredTo: Array,
  readBy: Array,
  editHistory: Array,
  reactions: Array,
  replyTo: ObjectId,
  messageType: String, // 'text', 'image', 'file', 'system'
  metadata: Object,
} as const;

/**
 * Conversation Schema Definition
 *
 * Represents a conversation (private or group chat).
 */
export const conversationSchema = {
  _id: ObjectId,
  type: String, // 'private', 'group'
  participants: Array,
  name: String,
  description: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
  lastMessageAt: Date,
  lastMessageId: ObjectId,
  settings: Object,
  metadata: Object,
} as const;

/**
 * Attachment Schema Definition
 *
 * Represents file attachments in messages.
 */
export const attachmentSchema = {
  _id: ObjectId,
  messageId: ObjectId,
  fileName: String,
  originalName: String,
  fileType: String,
  fileSize: Number,
  storageUrl: String,
  thumbnailUrl: String,
  createdAt: Date,
  metadata: Object,
} as const;

/**
 * Message Reaction Schema Definition
 *
 * Represents reactions to messages.
 */
export const messageReactionSchema = {
  _id: ObjectId,
  messageId: ObjectId,
  userId: String,
  emoji: String,
  createdAt: Date,
} as const;

/**
 * TypeScript Interfaces for Type Safety
 */

export interface MessageDocument {
  _id?: ObjectId;
  conversationId: ObjectId;
  senderId: string;
  content: string;
  attachments?: string[]; // Simplified to string array for now
  createdAt: Date;
  updatedAt: Date;
  deliveredTo?: string[];
  readBy?: string[];
  editHistory?: MessageEditHistory[];
  reactions?: MessageReactionDocument[];
  replyTo?: ObjectId;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
}

export interface ConversationDocument {
  _id?: ObjectId;
  type: 'private' | 'group';
  participants: string[];
  name?: string;
  description?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  lastMessageId?: ObjectId;
  settings?: ConversationSettings;
  metadata?: Record<string, any>;
}

export interface AttachmentDocument {
  _id?: ObjectId;
  messageId: ObjectId;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface MessageReactionDocument {
  _id?: ObjectId;
  messageId: ObjectId;
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * Supporting Types
 */

export interface MessageEditHistory {
  content: string;
  editedAt: Date;
  editedBy: string;
}

export interface ConversationSettings {
  notifications: boolean;
  muteUntil?: Date;
  theme?: string;
  customizations?: Record<string, any>;
}

/**
 * Collection Names
 */
export const COLLECTIONS = {
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  ATTACHMENTS: 'attachments',
  MESSAGE_REACTIONS: 'message_reactions',
} as const;

/**
 * Index Definitions for Performance
 */
export const INDEXES = {
  messages: [
    { conversationId: 1, createdAt: -1 },
    { senderId: 1 },
    { createdAt: -1 },
    { content: 'text' }, // Text search index
  ],
  conversations: [
    { participants: 1 },
    { lastMessageAt: -1 },
    { createdAt: -1 },
    { type: 1 },
  ],
  attachments: [{ messageId: 1 }, { createdAt: -1 }],
  message_reactions: [
    { messageId: 1 },
    { userId: 1, messageId: 1 }, // Compound index for user reactions
  ],
} as const;
