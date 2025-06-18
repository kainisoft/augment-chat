import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Conversation, 
  Message, 
  SendMessageRequest, 
  CreateConversationRequest,
  UpdateConversationRequest,
  MessageSearchRequest
} from '../../store/chat/chat.state';

/**
 * Chat Service
 * Handles HTTP requests for chat-related operations
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = environment.api.restApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get user conversations
   */
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  /**
   * Create a new conversation
   */
  createConversation(request: CreateConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, request);
  }

  /**
   * Update conversation details
   */
  updateConversation(request: UpdateConversationRequest): Observable<Conversation> {
    const { conversationId, ...updateData } = request;
    return this.http.patch<Conversation>(`${this.apiUrl}/conversations/${conversationId}`, updateData);
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string, limit = 50, offset = 0): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      params: { limit: limit.toString(), offset: offset.toString() }
    });
  }

  /**
   * Send a message
   */
  sendMessage(request: SendMessageRequest): Observable<Message> {
    const formData = new FormData();
    formData.append('content', request.content);
    formData.append('type', request.type || 'text');
    
    if (request.replyToId) {
      formData.append('replyToId', request.replyToId);
    }
    
    if (request.attachments) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this.http.post<Message>(`${this.apiUrl}/conversations/${request.conversationId}/messages`, formData);
  }

  /**
   * Edit a message
   */
  editMessage(messageId: string, content: string): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/messages/${messageId}`, { content });
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`);
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  /**
   * Mark conversation as read
   */
  markConversationAsRead(conversationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/read`, {});
  }

  /**
   * Add reaction to message
   */
  addMessageReaction(messageId: string, emoji: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/reactions`, { emoji });
  }

  /**
   * Remove reaction from message
   */
  removeMessageReaction(messageId: string, emoji: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}/reactions/${emoji}`);
  }

  /**
   * Pin conversation
   */
  pinConversation(conversationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/pin`, {});
  }

  /**
   * Unpin conversation
   */
  unpinConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}/pin`);
  }

  /**
   * Mute conversation
   */
  muteConversation(conversationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/mute`, {});
  }

  /**
   * Unmute conversation
   */
  unmuteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}/mute`);
  }

  /**
   * Archive conversation
   */
  archiveConversation(conversationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/archive`, {});
  }

  /**
   * Unarchive conversation
   */
  unarchiveConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}/archive`);
  }

  /**
   * Search messages
   */
  searchMessages(request: MessageSearchRequest): Observable<{
    messages: Message[];
    conversations: Conversation[];
  }> {
    const params: any = { q: request.query };
    
    if (request.conversationId) params.conversationId = request.conversationId;
    if (request.fromDate) params.fromDate = request.fromDate.toISOString();
    if (request.toDate) params.toDate = request.toDate.toISOString();
    if (request.messageType) params.messageType = request.messageType;
    if (request.limit) params.limit = request.limit.toString();
    if (request.offset) params.offset = request.offset.toString();

    return this.http.get<{
      messages: Message[];
      conversations: Conversation[];
    }>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get conversation participants
   */
  getConversationParticipants(conversationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${conversationId}/participants`);
  }

  /**
   * Add participant to conversation
   */
  addParticipant(conversationId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/participants`, { userId });
  }

  /**
   * Remove participant from conversation
   */
  removeParticipant(conversationId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}/participants/${userId}`);
  }

  /**
   * Leave conversation
   */
  leaveConversation(conversationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversations/${conversationId}/leave`, {});
  }
}
