'use client';

import { ApolloProvider } from '@/components/providers/apollo-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthGuard } from '../../components/auth/auth-guard';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ApolloProvider>
        <AuthGuard>
          <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left side - Branding/Info */}
            <div className="hidden md:flex flex-col justify-between p-8 bg-muted/50">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Real-time Chat App</h1>
                <p className="text-muted-foreground mt-2">
                  Connect and chat with your team in real-time
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Your Company. All rights reserved.
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="flex items-center justify-center p-8">{children}</div>
          </main>
        </AuthGuard>
      </ApolloProvider>

      <Toaster />
    </ThemeProvider>
  );
}
