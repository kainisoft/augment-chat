'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const publicPaths = ['/sign-in', '/sign-up', '/forgot-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/sign-in');
    } else if (isAuthenticated && publicPaths.includes(pathname)) {
      router.push('/chat');
    }
  }, [isAuthenticated, pathname, router]);

  // Show loading state while checking authentication
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}