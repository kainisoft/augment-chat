import { createAction, props } from '@ngrx/store';
import { 
  Conversation, 
  Message, 
  SendMessageRequest, 
  CreateConversationRequest,
  UpdateConversationRequest,
  MessageSearchRequest,
  TypingIndicator,
  MessageDraft
} from './chat.state';

/**
 * Conversation Actions
 */
export const loadConversations = createAction('[Chat] Load Conversations');

export const loadConversationsSuccess = createAction(
  '[Chat] Load Conversations Success',
  props<{ conversations: Conversation[] }>()
);

export const loadConversationsFailure = createAction(
  '[Chat] Load Conversations Failure',
  props<{ error: string }>()
);

export const createConversation = createAction(
  '[Chat] Create Conversation',
  props<{ request: CreateConversationRequest }>()
);

export const createConversationSuccess = createAction(
  '[Chat] Create Conversation Success',
  props<{ conversation: Conversation }>()
);

export const createConversationFailure = createAction(
  '[Chat] Create Conversation Failure',
  props<{ error: string }>()
);

export const updateConversation = createAction(
  '[Chat] Update Conversation',
  props<{ request: UpdateConversationRequest }>()
);

export const updateConversationSuccess = createAction(
  '[Chat] Update Conversation Success',
  props<{ conversation: Conversation }>()
);

export const updateConversationFailure = createAction(
  '[Chat] Update Conversation Failure',
  props<{ error: string }>()
);

export const setActiveConversation = createAction(
  '[Chat] Set Active Conversation',
  props<{ conversationId: string | null }>()
);

export const pinConversation = createAction(
  '[Chat] Pin Conversation',
  props<{ conversationId: string }>()
);

export const unpinConversation = createAction(
  '[Chat] Unpin Conversation',
  props<{ conversationId: string }>()
);

export const muteConversation = createAction(
  '[Chat] Mute Conversation',
  props<{ conversationId: string }>()
);

export const unmuteConversation = createAction(
  '[Chat] Unmute Conversation',
  props<{ conversationId: string }>()
);

export const archiveConversation = createAction(
  '[Chat] Archive Conversation',
  props<{ conversationId: string }>()
);

export const unarchiveConversation = createAction(
  '[Chat] Unarchive Conversation',
  props<{ conversationId: string }>()
);

/**
 * Message Actions
 */
export const loadMessages = createAction(
  '[Chat] Load Messages',
  props<{ conversationId: string; limit?: number; offset?: number }>()
);

export const loadMessagesSuccess = createAction(
  '[Chat] Load Messages Success',
  props<{ conversationId: string; messages: Message[] }>()
);

export const loadMessagesFailure = createAction(
  '[Chat] Load Messages Failure',
  props<{ error: string }>()
);

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ request: SendMessageRequest }>()
);

export const sendMessageSuccess = createAction(
  '[Chat] Send Message Success',
  props<{ message: Message }>()
);

export const sendMessageFailure = createAction(
  '[Chat] Send Message Failure',
  props<{ error: string }>()
);

export const receiveMessage = createAction(
  '[Chat] Receive Message',
  props<{ message: Message }>()
);

export const editMessage = createAction(
  '[Chat] Edit Message',
  props<{ messageId: string; content: string }>()
);

export const editMessageSuccess = createAction(
  '[Chat] Edit Message Success',
  props<{ message: Message }>()
);

export const editMessageFailure = createAction(
  '[Chat] Edit Message Failure',
  props<{ error: string }>()
);

export const deleteMessage = createAction(
  '[Chat] Delete Message',
  props<{ messageId: string }>()
);

export const deleteMessageSuccess = createAction(
  '[Chat] Delete Message Success',
  props<{ messageId: string }>()
);

export const deleteMessageFailure = createAction(
  '[Chat] Delete Message Failure',
  props<{ error: string }>()
);

export const markMessageAsRead = createAction(
  '[Chat] Mark Message As Read',
  props<{ messageId: string; conversationId: string }>()
);

export const markConversationAsRead = createAction(
  '[Chat] Mark Conversation As Read',
  props<{ conversationId: string }>()
);

export const addMessageReaction = createAction(
  '[Chat] Add Message Reaction',
  props<{ messageId: string; emoji: string }>()
);

export const removeMessageReaction = createAction(
  '[Chat] Remove Message Reaction',
  props<{ messageId: string; emoji: string }>()
);

/**
 * Real-time Actions
 */
export const startTyping = createAction(
  '[Chat] Start Typing',
  props<{ conversationId: string }>()
);

export const stopTyping = createAction(
  '[Chat] Stop Typing',
  props<{ conversationId: string }>()
);

export const userStartedTyping = createAction(
  '[Chat] User Started Typing',
  props<{ typingIndicator: TypingIndicator }>()
);

export const userStoppedTyping = createAction(
  '[Chat] User Stopped Typing',
  props<{ userId: string; conversationId: string }>()
);

export const updateUserOnlineStatus = createAction(
  '[Chat] Update User Online Status',
  props<{ userId: string; isOnline: boolean }>()
);

/**
 * Draft Actions
 */
export const saveDraft = createAction(
  '[Chat] Save Draft',
  props<{ draft: MessageDraft }>()
);

export const clearDraft = createAction(
  '[Chat] Clear Draft',
  props<{ conversationId: string }>()
);

export const loadDraft = createAction(
  '[Chat] Load Draft',
  props<{ conversationId: string }>()
);

/**
 * Search Actions
 */
export const searchMessages = createAction(
  '[Chat] Search Messages',
  props<{ request: MessageSearchRequest }>()
);

export const searchMessagesSuccess = createAction(
  '[Chat] Search Messages Success',
  props<{ query: string; messages: Message[]; conversations: Conversation[] }>()
);

export const searchMessagesFailure = createAction(
  '[Chat] Search Messages Failure',
  props<{ error: string }>()
);

export const clearSearchResults = createAction('[Chat] Clear Search Results');

/**
 * General Actions
 */
export const clearChatError = createAction('[Chat] Clear Chat Error');

export const setChatLoading = createAction(
  '[Chat] Set Chat Loading',
  props<{ loading: boolean }>()
);
