'use client';

import { useChat } from '@/hooks/useChat';
import { Chat } from '@/types/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { UserAvatar } from '../user/user-avatar';

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const { selectedChat, selectChat } = useChat();
  const isSelected = selectedChat?.id === chat.id;

  return (
    <button
      className={cn(
        'w-full p-3 flex items-center gap-3 rounded-lg hover:bg-muted transition-colors',
        isSelected && 'bg-muted'
      )}
      onClick={() => selectChat(chat)}
    >
      <UserAvatar
        user={chat.isGroup ? undefined : chat.members[0]?.user}
        fallback={chat.name?.[0] ?? '?'}
      />
      <div className="flex-1 text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium">{chat.name}</span>
          {chat.lastMessageAt && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(chat.lastMessageAt), 'HH:mm')}
            </span>
          )}
        </div>
        {chat.messages?.[0] && (
          <p className="text-sm text-muted-foreground truncate">
            {chat.messages[0].content}
          </p>
        )}
      </div>
    </button>
  );
}