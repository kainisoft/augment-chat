'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';

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
    <div>
      <h1>Chat Page</h1>
      {/* Your chat component content */}
    </div>
  );
}