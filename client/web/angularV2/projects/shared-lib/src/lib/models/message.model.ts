/**
 * Message model with metadata
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: number;
  status: MessageStatus;
  metadata?: MessageMetadata;
  reactions?: Reaction[];
  replies?: Message[];
}

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageMetadata {
  aiSuggested?: boolean;
  edited?: boolean;
  editHistory?: EditHistory[];
  mentions?: string[];
  attachments?: Attachment[];
  encryption?: EncryptionInfo;
}

export interface EditHistory {
  timestamp: number;
  previousContent: string;
  reason?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

export interface EncryptionInfo {
  algorithm: string;
  keyId: string;
  encrypted: boolean;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: number;
  count: number;
}