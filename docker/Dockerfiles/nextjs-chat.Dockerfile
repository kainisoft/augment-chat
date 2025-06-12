# syntax=docker/dockerfile:1.4
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Copy workspace configuration files
COPY client/web/nextjs/package.json client/web/nextjs/pnpm-lock.yaml ./
COPY client/web/nextjs/pnpm-workspace.yaml ./

# Copy package.json files for all workspace packages
COPY client/web/nextjs/apps/chat/package.json ./apps/chat/
COPY client/web/nextjs/apps/docs/package.json ./apps/docs/

# Copy packages directory structure first
COPY client/web/nextjs/packages ./packages

# Install dependencies with BuildKit cache mount (no frozen lockfile for development)
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --no-frozen-lockfile

# Copy workspace configuration files
COPY client/web/nextjs/turbo.json ./

# Copy source code for apps (packages already copied)
COPY client/web/nextjs/apps ./apps

# Expose port for Next.js chat app
EXPOSE 5000

# Expose port for Next.js docs app (if needed)
EXPOSE 5001

# Set working directory to the chat app
WORKDIR /app/apps/chat

# Start the Next.js development server with Turbopack
CMD ["pnpm", "dev"]
