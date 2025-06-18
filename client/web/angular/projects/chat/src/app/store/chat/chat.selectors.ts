import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.state';

/**
 * Chat Selectors
 * Provides memoized selectors for chat state
 */

// Feature selector for chat state
export const selectChatState = createFeatureSelector<ChatState>('chat');

// Basic selectors
export const selectConversations = createSelector(
  selectChatState,
  (state) => state.conversations
);

export const selectMessages = createSelector(
  selectChatState,
  (state) => state.messages
);

export const selectActiveConversationId = createSelector(
  selectChatState,
  (state) => state.activeConversationId
);

export const selectTypingUsers = createSelector(
  selectChatState,
  (state) => state.typingUsers
);

export const selectOnlineUsers = createSelector(
  selectChatState,
  (state) => state.onlineUsers
);

export const selectMessageDrafts = createSelector(
  selectChatState,
  (state) => state.messageDrafts
);

export const selectSearchResults = createSelector(
  selectChatState,
  (state) => state.searchResults
);

export const selectChatLoading = createSelector(
  selectChatState,
  (state) => state.loading
);

export const selectChatError = createSelector(
  selectChatState,
  (state) => state.error
);

// Computed selectors
export const selectActiveConversation = createSelector(
  selectConversations,
  selectActiveConversationId,
  (conversations, activeId) => 
    activeId ? conversations.find(conv => conv.id === activeId) : null
);

export const selectActiveConversationMessages = createSelector(
  selectMessages,
  selectActiveConversationId,
  (messages, activeId) => 
    activeId ? messages[activeId] || [] : []
);

export const selectPinnedConversations = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => conv.isPinned)
);

export const selectUnpinnedConversations = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => !conv.isPinned)
);

export const selectArchivedConversations = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => conv.isArchived)
);

export const selectActiveConversations = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => !conv.isArchived)
);

export const selectDirectConversations = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => conv.type === 'direct')
);

export const selectGroupConversations = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => conv.type === 'group')
);

export const selectUnreadConversationsCount = createSelector(
  selectConversations,
  (conversations) => conversations.filter(conv => conv.unreadCount > 0).length
);

export const selectTotalUnreadCount = createSelector(
  selectConversations,
  (conversations) => conversations.reduce((total, conv) => total + conv.unreadCount, 0)
);

// Conversation-specific selectors
export const selectConversationById = (conversationId: string) =>
  createSelector(
    selectConversations,
    (conversations) => conversations.find(conv => conv.id === conversationId)
  );

export const selectMessagesByConversationId = (conversationId: string) =>
  createSelector(
    selectMessages,
    (messages) => messages[conversationId] || []
  );

export const selectTypingUsersInConversation = (conversationId: string) =>
  createSelector(
    selectTypingUsers,
    (typingUsers) => typingUsers[conversationId] || []
  );

export const selectDraftForConversation = (conversationId: string) =>
  createSelector(
    selectMessageDrafts,
    (drafts) => drafts[conversationId]
  );

// Online status selectors
export const selectIsUserOnline = (userId: string) =>
  createSelector(
    selectOnlineUsers,
    (onlineUsers) => onlineUsers.has(userId)
  );

export const selectOnlineUsersCount = createSelector(
  selectOnlineUsers,
  (onlineUsers) => onlineUsers.size
);

// Search selectors
export const selectSearchQuery = createSelector(
  selectSearchResults,
  (results) => results?.query || ''
);

export const selectSearchMessages = createSelector(
  selectSearchResults,
  (results) => results?.messages || []
);

export const selectSearchConversations = createSelector(
  selectSearchResults,
  (results) => results?.conversations || []
);

export const selectHasSearchResults = createSelector(
  selectSearchResults,
  (results) => !!results && (results.messages.length > 0 || results.conversations.length > 0)
);

// Combined selectors for UI components
export const selectChatUIState = createSelector(
  selectConversations,
  selectActiveConversationId,
  selectChatLoading,
  selectChatError,
  (conversations, activeConversationId, loading, error) => ({
    conversations,
    activeConversationId,
    loading,
    error,
  })
);

export const selectConversationListUIState = createSelector(
  selectActiveConversations,
  selectPinnedConversations,
  selectUnreadConversationsCount,
  selectTotalUnreadCount,
  selectChatLoading,
  (conversations, pinnedConversations, unreadCount, totalUnread, loading) => ({
    conversations,
    pinnedConversations,
    unreadCount,
    totalUnread,
    loading,
  })
);

export const selectActiveConversationUIState = createSelector(
  selectActiveConversation,
  selectActiveConversationMessages,
  selectActiveConversationId,
  selectChatLoading,
  selectChatError,
  (conversation, messages, conversationId, loading, error) => ({
    conversation,
    messages,
    conversationId,
    loading,
    error,
  })
);

// Message utility selectors
export const selectLastMessageInConversation = (conversationId: string) =>
  createSelector(
    selectMessagesByConversationId(conversationId),
    (messages) => messages[messages.length - 1] || null
  );

export const selectUnreadMessagesInConversation = (conversationId: string) =>
  createSelector(
    selectMessagesByConversationId(conversationId),
    (messages) => messages.filter(msg => Object.keys(msg.readBy).length === 0)
  );
