import { ThemeProvider } from "@/components/providers/theme-provider";
import { ApolloProvider } from "@/components/providers/apollo-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ApolloProvider>
        <AuthGuard>{children}</AuthGuard>
      </ApolloProvider>
      <Toaster />
    </ThemeProvider>
  );
}