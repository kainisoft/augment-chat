/**
 * Real-time event models
 */
export interface WebSocketEvent {
  type: EventType;
  payload: unknown;
  timestamp: number;
  userId?: string;
  conversationId?: string;
}

export type EventType = 
  | 'message:new'
  | 'message:update'
  | 'message:delete'
  | 'user:typing'
  | 'user:presence'
  | 'conversation:update'
  | 'conversation:member:join'
  | 'conversation:member:leave'
  | 'reaction:add'
  | 'reaction:remove';

export interface MessageEvent extends WebSocketEvent {
  type: 'message:new' | 'message:update' | 'message:delete';
  payload: MessageEventPayload;
}

export interface MessageEventPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  content?: string;
  timestamp: number;
}

export interface TypingEvent extends WebSocketEvent {
  type: 'user:typing';
  payload: TypingEventPayload;
}

export interface TypingEventPayload {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface PresenceEvent extends WebSocketEvent {
  type: 'user:presence';
  payload: PresenceEventPayload;
}

export interface PresenceEventPayload {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: number;
}

export interface ConversationEvent extends WebSocketEvent {
  type: 'conversation:update' | 'conversation:member:join' | 'conversation:member:leave';
  payload: ConversationEventPayload;
}

export interface ConversationEventPayload {
  conversationId: string;
  userId?: string;
  changes?: Record<string, unknown>;
}