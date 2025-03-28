'use client';

import { Chat } from '@/types/chat';
import { UserAvatar } from '../user/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, UserPlus, LogOut } from 'lucide-react';

interface ChatHeaderProps {
  chat: Chat;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const otherMembers = chat.members.filter(
    (member) => member.user.id !== 'current-user-id'
  );

  return (
    <div className="h-16 border-b flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <UserAvatar
          user={chat.isGroup ? undefined : otherMembers[0]?.user}
          fallback={chat.name?.[0] ?? '?'}
          className="h-8 w-8"
        />
        <div>
          <h2 className="font-medium">
            {chat.name || otherMembers[0]?.user.username}
          </h2>
          {chat.isGroup && (
            <p className="text-sm text-muted-foreground">
              {chat.members.length} members
            </p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {chat.isGroup && (
            <DropdownMenuItem>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Members
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Leave Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}