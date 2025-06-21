/**
 * Chat Store Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all chat-related store items.
 * Use named imports to maintain optimal bundle size.
 */

// Actions - Export as namespace to maintain organization
export * as ChatActions from './chat.actions';

// Selectors - Export individual selectors for tree-shaking
export {
  selectChatState,
  selectConversations,
  selectMessages,
  selectActiveConversationId,
  selectTypingUsers,
  selectOnlineUsers,
  selectMessageDrafts,
  selectSearchResults,
  selectChatLoading,
  selectChatError,
  selectActiveConversation,
  selectActiveConversationMessages,
  selectPinnedConversations,
  selectUnpinnedConversations,
  selectArchivedConversations,
  selectActiveConversations,
  selectDirectConversations,
  selectGroupConversations,
  selectUnreadConversationsCount,
  selectTotalUnreadCount,
  selectConversationById,
  selectMessagesByConversationId,
  selectTypingUsersInConversation,
  selectDraftForConversation,
  selectIsUserOnline,
  selectOnlineUsersCount,
  selectSearchQuery,
  selectSearchMessages,
  selectSearchConversations,
  selectHasSearchResults,
  selectChatUIState,
  selectConversationListUIState,
  selectActiveConversationUIState,
  selectLastMessageInConversation,
  selectUnreadMessagesInConversation
} from './chat.selectors';

// State types - Export for type safety
export type {
  ChatState,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  TypingIndicator,
  MessageDraft,
  SendMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  MessageSearchRequest
} from './chat.state';

// Reducer - Export for store configuration
export { chatReducer } from './chat.reducer';

// Effects - Export for store configuration
export { ChatEffects } from './chat.effects';
