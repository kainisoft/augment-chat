import { createReducer, on } from '@ngrx/store';
import { ChatState, initialChatState } from './chat.state';
import * as ChatActions from './chat.actions';

/**
 * Chat reducer
 * Handles state changes for chat-related actions
 */
export const chatReducer = createReducer(
  initialChatState,

  // Conversation Actions
  on(ChatActions.loadConversations, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(ChatActions.loadConversationsSuccess, (state, { conversations }) => ({
    ...state,
    conversations,
    loading: false,
    error: null,
  })),

  on(ChatActions.loadConversationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ChatActions.createConversationSuccess, (state, { conversation }) => ({
    ...state,
    conversations: [conversation, ...state.conversations],
    loading: false,
    error: null,
  })),

  on(ChatActions.updateConversationSuccess, (state, { conversation }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversation.id ? conversation : conv
    ),
    loading: false,
    error: null,
  })),

  on(ChatActions.setActiveConversation, (state, { conversationId }) => ({
    ...state,
    activeConversationId: conversationId,
  })),

  on(ChatActions.pinConversation, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, isPinned: true } : conv
    ),
  })),

  on(ChatActions.unpinConversation, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, isPinned: false } : conv
    ),
  })),

  on(ChatActions.muteConversation, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, isMuted: true } : conv
    ),
  })),

  on(ChatActions.unmuteConversation, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, isMuted: false } : conv
    ),
  })),

  on(ChatActions.archiveConversation, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, isArchived: true } : conv
    ),
  })),

  on(ChatActions.unarchiveConversation, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, isArchived: false } : conv
    ),
  })),

  // Message Actions
  on(ChatActions.loadMessages, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(ChatActions.loadMessagesSuccess, (state, { conversationId, messages }) => ({
    ...state,
    messages: {
      ...state.messages,
      [conversationId]: messages,
    },
    loading: false,
    error: null,
  })),

  on(ChatActions.loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ChatActions.sendMessageSuccess, (state, { message }) => ({
    ...state,
    messages: {
      ...state.messages,
      [message.conversationId]: [
        ...(state.messages[message.conversationId] || []),
        message,
      ],
    },
    conversations: state.conversations.map(conv =>
      conv.id === message.conversationId
        ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
        : conv
    ),
    loading: false,
    error: null,
  })),

  on(ChatActions.receiveMessage, (state, { message }) => ({
    ...state,
    messages: {
      ...state.messages,
      [message.conversationId]: [
        ...(state.messages[message.conversationId] || []),
        message,
      ],
    },
    conversations: state.conversations.map(conv =>
      conv.id === message.conversationId
        ? { 
            ...conv, 
            lastMessage: message, 
            updatedAt: message.createdAt,
            unreadCount: conv.unreadCount + 1,
          }
        : conv
    ),
  })),

  on(ChatActions.editMessageSuccess, (state, { message }) => ({
    ...state,
    messages: {
      ...state.messages,
      [message.conversationId]: state.messages[message.conversationId]?.map(msg =>
        msg.id === message.id ? message : msg
      ) || [],
    },
    loading: false,
    error: null,
  })),

  on(ChatActions.deleteMessageSuccess, (state, { messageId }) => {
    const updatedMessages = { ...state.messages };
    
    Object.keys(updatedMessages).forEach(conversationId => {
      updatedMessages[conversationId] = updatedMessages[conversationId].filter(
        msg => msg.id !== messageId
      );
    });

    return {
      ...state,
      messages: updatedMessages,
      loading: false,
      error: null,
    };
  }),

  on(ChatActions.markConversationAsRead, (state, { conversationId }) => ({
    ...state,
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ),
  })),

  // Real-time Actions
  on(ChatActions.userStartedTyping, (state, { typingIndicator }) => ({
    ...state,
    typingUsers: {
      ...state.typingUsers,
      [typingIndicator.conversationId]: [
        ...(state.typingUsers[typingIndicator.conversationId] || []).filter(
          indicator => indicator.userId !== typingIndicator.userId
        ),
        typingIndicator,
      ],
    },
  })),

  on(ChatActions.userStoppedTyping, (state, { userId, conversationId }) => ({
    ...state,
    typingUsers: {
      ...state.typingUsers,
      [conversationId]: (state.typingUsers[conversationId] || []).filter(
        indicator => indicator.userId !== userId
      ),
    },
  })),

  on(ChatActions.updateUserOnlineStatus, (state, { userId, isOnline }) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    
    if (isOnline) {
      newOnlineUsers.add(userId);
    } else {
      newOnlineUsers.delete(userId);
    }

    return {
      ...state,
      onlineUsers: newOnlineUsers,
      conversations: state.conversations.map(conv => ({
        ...conv,
        participants: conv.participants.map(participant =>
          participant.userId === userId
            ? { ...participant, isOnline }
            : participant
        ),
      })),
    };
  }),

  // Draft Actions
  on(ChatActions.saveDraft, (state, { draft }) => ({
    ...state,
    messageDrafts: {
      ...state.messageDrafts,
      [draft.conversationId]: draft,
    },
  })),

  on(ChatActions.clearDraft, (state, { conversationId }) => {
    const { [conversationId]: removed, ...remainingDrafts } = state.messageDrafts;
    return {
      ...state,
      messageDrafts: remainingDrafts,
    };
  }),

  // Search Actions
  on(ChatActions.searchMessagesSuccess, (state, { query, messages, conversations }) => ({
    ...state,
    searchResults: {
      query,
      messages,
      conversations,
    },
    loading: false,
    error: null,
  })),

  on(ChatActions.clearSearchResults, (state) => ({
    ...state,
    searchResults: null,
  })),

  // General Actions
  on(ChatActions.clearChatError, (state) => ({
    ...state,
    error: null,
  })),

  on(ChatActions.setChatLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),

  // Error handling for failed actions
  on(
    ChatActions.createConversationFailure,
    ChatActions.updateConversationFailure,
    ChatActions.sendMessageFailure,
    ChatActions.editMessageFailure,
    ChatActions.deleteMessageFailure,
    ChatActions.searchMessagesFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  )
);
