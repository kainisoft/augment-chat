import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ApolloProvider } from "@/components/providers/apollo-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real-time Chat App",
  description: "A modern chat application with real-time messaging capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ApolloProvider>
          <AuthGuard>{children}</AuthGuard>
        </ApolloProvider>
      </body>
    </html>
  );
}
