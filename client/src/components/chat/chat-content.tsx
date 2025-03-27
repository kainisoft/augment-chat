'use client';

import { useChat } from '@/hooks/useChat';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { ChatHeader } from './chat-header';

export function ChatContent() {
  const { selectedChat } = useChat();

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader chat={selectedChat} />
      <MessageList />
      <MessageInput />
    </div>
  );
}