'use client';

import { createContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_CHATS, NEW_MESSAGE_SUBSCRIPTION, SEND_MESSAGE } from '@/graphql/chat';
import type { Chat, Message } from '@/types/chat';

interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  loading: boolean;
  selectChat: (chat: Chat) => void;
  sendMessage: (content: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  const { data, loading } = useQuery(GET_CHATS);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChat?.id },
    onData: ({ data }) => {
      // Handle new message
    },
  });

  const selectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat) return;

      await sendMessageMutation({
        variables: {
          chatId: selectedChat.id,
          content,
        },
      });
    },
    [selectedChat, sendMessageMutation]
  );

  return (
    <ChatContext.Provider
      value={{
        chats: data?.chats ?? [],
        selectedChat,
        messages: selectedChat?.messages ?? [],
        loading,
        selectChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}