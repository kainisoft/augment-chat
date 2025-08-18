import { Message } from './message.model';

/**
 * Conversation model
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[];
  name?: string;
  description?: string;
  avatar?: string;
  settings: ConversationSettings;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

export type ConversationType = 'direct' | 'group' | 'channel';

export interface ConversationSettings {
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  notifications: boolean;
  readReceipts: boolean;
  typing: boolean;
  encryption: boolean;
}

export interface ConversationMember {
  userId: string;
  role: MemberRole;
  joinedAt: number;
  permissions: MemberPermissions;
}

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface MemberPermissions {
  canSendMessages: boolean;
  canDeleteMessages: boolean;
  canEditMessages: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canChangeSettings: boolean;
}