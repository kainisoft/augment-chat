export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  status: UserStatus;
}

export interface ChatMember {
  id: string;
  user: User;
  role: 'ADMIN' | 'MEMBER';
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  lastMessageAt?: string;
  members: ChatMember[];
  messages: Message[];
}

export interface MessageConnection {
  edges: {
    node: Message;
    cursor: string;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}