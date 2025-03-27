'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatContent } from '@/components/chat/chat-content';
import { ChatProvider } from '@/components/providers/chat-provider';

export default function ChatPage() {
  const { isLoading } = useAuthCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="h-screen flex">
        <ChatSidebar />
        <ChatContent />
      </div>
    </ChatProvider>
  );
}
