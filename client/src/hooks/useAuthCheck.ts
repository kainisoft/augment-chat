import { useAuthStore } from '@/stores/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!isAuthenticated && !isPublicPath) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, isPublicPath, router]);

  return {
    isAuthenticated,
    isPublicPath,
    isLoading: !isAuthenticated && !isPublicPath,
  };
}
