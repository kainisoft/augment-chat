import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  updateTokens: (token: string, refreshToken: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, refreshToken, user) => 
        set({ token, refreshToken, user, isAuthenticated: true }),
      updateTokens: (token, refreshToken) =>
        set((state) => ({ token, refreshToken })),
      signOut: () => 
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window !== 'undefined') {
            const item = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
              ?.split('=')[1];
            return item ? JSON.parse(decodeURIComponent(item)) : null;
          }
          return null;
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined') {
            const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
            document.cookie = `${name}=${encodeURIComponent(
              JSON.stringify(value)
            )}; path=/; max-age=31536000; ${secure} SameSite=Lax`;
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined') {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
        },
      })),
    }
  )
);
