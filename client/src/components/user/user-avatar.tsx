'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/chat';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: User;
  fallback?: string;
  className?: string;
}

export function UserAvatar({ user, fallback, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('h-10 w-10', className)}>
      {user?.avatarUrl ? (
        <AvatarImage
          src={user.avatarUrl}
          alt={user.username}
        />
      ) : (
        <AvatarFallback>
          {fallback || user?.username?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      )}
    </Avatar>
  );
}