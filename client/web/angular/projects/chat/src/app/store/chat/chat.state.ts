/**
 * Message attachment interface
 */
export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  attachments?: MessageAttachment[];
  replyToId?: string;
  editedAt?: Date;
  deletedAt?: Date;
  reactions: Record<string, string[]>; // emoji -> userIds
  readBy: Record<string, Date>; // userId -> readAt
  deliveredTo: Record<string, Date>; // userId -> deliveredAt
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation participant interface
 */
export interface ConversationParticipant {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  lastSeenAt?: Date;
  isOnline: boolean;
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Typing indicator interface
 */
export interface TypingIndicator {
  userId: string;
  username: string;
  conversationId: string;
  startedAt: Date;
}

/**
 * Message draft interface
 */
export interface MessageDraft {
  conversationId: string;
  content: string;
  replyToId?: string;
  attachments?: File[];
  updatedAt: Date;
}

/**
 * Chat state interface
 */
export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  activeConversationId: string | null;
  typingUsers: Record<string, TypingIndicator[]>; // conversationId -> typing users
  onlineUsers: Set<string>;
  messageDrafts: Record<string, MessageDraft>; // conversationId -> draft
  searchResults: {
    query: string;
    messages: Message[];
    conversations: Conversation[];
  } | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial chat state
 */
export const initialChatState: ChatState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  onlineUsers: new Set(),
  messageDrafts: {},
  searchResults: null,
  loading: false,
  error: null,
};

/**
 * Send message request interface
 */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  replyToId?: string;
  attachments?: File[];
}

/**
 * Create conversation request interface
 */
export interface CreateConversationRequest {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  description?: string;
}

/**
 * Update conversation request interface
 */
export interface UpdateConversationRequest {
  conversationId: string;
  name?: string;
  description?: string;
  avatar?: File;
}

/**
 * Message search request interface
 */
export interface MessageSearchRequest {
  query: string;
  conversationId?: string;
  fromDate?: Date;
  toDate?: Date;
  messageType?: string;
  limit?: number;
  offset?: number;
}
