'use client';

import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Message as MessageType } from '@/types/chat';
import { UserAvatar } from '../user/user-avatar';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const { user } = useAuth();
  const isOwn = message.sender.id === user?.id;

  return (
    <div
      className={cn(
        'flex gap-2',
        isOwn && 'flex-row-reverse'
      )}
    >
      <UserAvatar
        user={message.sender}
        className="h-8 w-8 flex-shrink-0"
      />
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[70%]',
          isOwn && 'items-end'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isOwn && 'order-2'
            )}
          >
            {message.sender.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
        </div>
        <div
          className={cn(
            'rounded-lg px-3 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}