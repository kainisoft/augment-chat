'use client';

import {
  GET_CHAT_MESSAGES,
  GET_CHATS,
  NEW_MESSAGE_SUBSCRIPTION,
  SEND_MESSAGE,
} from '@/graphql/chat';
import type { Chat, Message, MessageConnection } from '@/types/chat';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { createContext, useCallback, useRef, useState } from 'react';

interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  selectChat: (chat: Chat) => void;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const endCursor = useRef<string | null>(null);
  const { data: chatsData, loading: chatsLoading } = useQuery(GET_CHATS);

  const { loading: messagesLoading, fetchMore } = useQuery(GET_CHAT_MESSAGES, {
    variables: {
      input: {
        chatId: selectedChat?.id,
        limit: 50,
      },
    },
    skip: !selectedChat,
    onCompleted: (data) => {
      const connection = data.messages as MessageConnection;
      setMessages(connection.edges.map((edge) => edge.node));
      setHasMore(connection.pageInfo.hasNextPage);
      endCursor.current = connection.pageInfo.endCursor;
    },
  });

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChat?.id },
    skip: !selectedChat,
    onData: ({ data }) => {
      const newMessage = data.data.messageCreated;
      setMessages((prev) => [...prev, newMessage]);
    },
  });

  const selectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    setMessages([]);
    setHasMore(false);
    endCursor.current = null;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat) return;

      const { data } = await sendMessageMutation({
        variables: {
          chatId: selectedChat.id,
          content,
        },
      });

      setMessages((prev) => [...prev, data.sendMessage]);
    },
    [selectedChat, sendMessageMutation]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!selectedChat || !hasMore || loadingMore || !endCursor.current) return;

    setLoadingMore(true);
    try {
      const { data } = await fetchMore({
        variables: {
          input: {
            chatId: selectedChat.id,
            limit: 50,
            before: endCursor.current,
          },
        },
      });

      const connection = data.messages as MessageConnection;
      setMessages((prev) => [...connection.edges.map((edge) => edge.node), ...prev]);
      setHasMore(connection.pageInfo.hasNextPage);
      endCursor.current = connection.pageInfo.endCursor;
    } finally {
      setLoadingMore(false);
    }
  }, [selectedChat, hasMore, loadingMore, fetchMore]);

  return (
    <ChatContext.Provider
      value={{
        chats: chatsData?.chats ?? [],
        selectedChat,
        messages,
        loading: chatsLoading || messagesLoading,
        loadingMore,
        hasMore,
        selectChat,
        sendMessage,
        loadMoreMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
