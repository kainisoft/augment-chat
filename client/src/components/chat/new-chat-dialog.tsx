'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CHAT } from '@/graphql/chat';
import { SEARCH_USERS } from '@/graphql/users';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { UserAvatar } from '../user/user-avatar';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const [search, setSearch] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data, loading } = useQuery(SEARCH_USERS, {
    variables: { query: search },
    skip: !search,
  });

  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    onCompleted: () => {
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setSearch('');
    setIsGroup(false);
    setGroupName('');
    setSelectedUsers([]);
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    await createChat({
      variables: {
        input: {
          userIds: selectedUsers,
          isGroup,
          name: isGroup ? groupName : undefined,
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isGroup"
              checked={isGroup}
              onCheckedChange={(checked) => setIsGroup(checked as boolean)}
            />
            <Label htmlFor="isGroup">Create group chat</Label>
          </div>

          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Users</Label>
            <Command>
              <CommandInput
                placeholder="Search users..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {data?.searchUsers.map((user: any) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      setSelectedUsers((prev) =>
                        prev.includes(user.id)
                          ? prev.filter((id) => id !== user.id)
                          : [...prev, user.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        className="mr-2"
                      />
                      <UserAvatar user={user} className="h-8 w-8" />
                      <span>{user.username}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              creating ||
              selectedUsers.length === 0 ||
              (isGroup && !groupName.trim())
            }
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}