# syntax=docker/dockerfile:1.4
FROM node:20-alpine

WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Install dependencies with BuildKit cache mount and frozen lockfile
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy only necessary files for the websocket-gateway service
# This reduces the context size and improves build time
COPY tsconfig.json nest-cli.json ./
COPY apps/api-gateway ./apps/websocket-gateway
COPY libs ./libs

# Expose port 4001
EXPOSE 4001

# Start the application
CMD ["pnpm", "run", "start:debug", "websocket-gateway"]
