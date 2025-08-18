import { Injectable, signal, computed, effect } from '@angular/core';
import { SignalState, ConnectionStatus } from '../models/state.model';
import { User } from '../models/user.model';
import { Message } from '../models/message.model';
import { Conversation } from '../models/conversation.model';

/**
 * Signal-based store service for global state management
 */
@Injectable({
  providedIn: 'root'
})
export class SignalStoreService implements SignalState {
  // Core signals
  user = signal<User | null>(null);
  conversations = signal<Conversation[]>([]);
  activeConversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  typingUsers = signal<User[]>([]);
  connectionStatus = signal<ConnectionStatus>('disconnected');
  
  // Computed signals
  readonly isAuthenticated = computed(() => !!this.user());
  readonly activeConversationId = computed(() => this.activeConversation()?.id || null);
  readonly unreadCount = computed(() => 
    this.conversations().reduce((count, conv) => count + conv.unreadCount, 0)
  );
  readonly sortedMessages = computed(() => 
    [...this.messages()].sort((a, b) => a.timestamp - b.timestamp)
  );
  readonly isConnected = computed(() => this.connectionStatus() === 'connected');
  
  constructor() {
    // Effect to persist user data
    effect(() => {
      const user = this.user();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });
    
    // Effect to persist active conversation
    effect(() => {
      const activeConv = this.activeConversation();
      if (activeConv) {
        localStorage.setItem('activeConversationId', activeConv.id);
      }
    });
    
    this.loadPersistedState();
  }
  
  /**
   * Set the current user
   */
  setUser(user: User | null): void {
    this.user.set(user);
  }
  
  /**
   * Update user properties
   */
  updateUser(updates: Partial<User>): void {
    const currentUser = this.user();
    if (currentUser) {
      this.user.set({ ...currentUser, ...updates });
    }
  }
  
  /**
   * Set conversations list
   */
  setConversations(conversations: Conversation[]): void {
    this.conversations.set(conversations);
  }
  
  /**
   * Add or update a conversation
   */
  upsertConversation(conversation: Conversation): void {
    const conversations = this.conversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    this.conversations.set([...conversations]);
  }
  
  /**
   * Remove a conversation
   */
  removeConversation(conversationId: string): void {
    const conversations = this.conversations().filter(c => c.id !== conversationId);
    this.conversations.set(conversations);
    
    // Clear active conversation if it was removed
    if (this.activeConversation()?.id === conversationId) {
      this.activeConversation.set(null);
    }
  }
  
  /**
   * Set active conversation
   */
  setActiveConversation(conversation: Conversation | null): void {
    this.activeConversation.set(conversation);
    
    // Clear messages when switching conversations
    if (conversation) {
      this.messages.set([]);
    }
  }
  
  /**
   * Set messages for active conversation
   */
  setMessages(messages: Message[]): void {
    this.messages.set(messages);
  }
  
  /**
   * Add a new message
   */
  addMessage(message: Message): void {
    const messages = [...this.messages(), message];
    this.messages.set(messages);
  }
  
  /**
   * Update a message
   */
  updateMessage(messageId: string, updates: Partial<Message>): void {
    const messages = this.messages().map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    this.messages.set(messages);
  }
  
  /**
   * Remove a message
   */
  removeMessage(messageId: string): void {
    const messages = this.messages().filter(msg => msg.id !== messageId);
    this.messages.set(messages);
  }
  
  /**
   * Set typing users
   */
  setTypingUsers(users: User[]): void {
    this.typingUsers.set(users);
  }
  
  /**
   * Add typing user
   */
  addTypingUser(user: User): void {
    const typingUsers = this.typingUsers();
    if (!typingUsers.find(u => u.id === user.id)) {
      this.typingUsers.set([...typingUsers, user]);
    }
  }
  
  /**
   * Remove typing user
   */
  removeTypingUser(userId: string): void {
    const typingUsers = this.typingUsers().filter(u => u.id !== userId);
    this.typingUsers.set(typingUsers);
  }
  
  /**
   * Set connection status
   */
  setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus.set(status);
  }
  
  /**
   * Clear all state (logout)
   */
  clearState(): void {
    this.user.set(null);
    this.conversations.set([]);
    this.activeConversation.set(null);
    this.messages.set([]);
    this.typingUsers.set([]);
    this.connectionStatus.set('disconnected');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('activeConversationId');
  }
  
  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): void {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.user.set(JSON.parse(savedUser));
      }
      
      const activeConvId = localStorage.getItem('activeConversationId');
      if (activeConvId) {
        // Will be set when conversations are loaded
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }
  
  /**
   * Get conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.conversations().find(c => c.id === id);
  }
  
  /**
   * Get message by ID
   */
  getMessage(id: string): Message | undefined {
    return this.messages().find(m => m.id === id);
  }
}