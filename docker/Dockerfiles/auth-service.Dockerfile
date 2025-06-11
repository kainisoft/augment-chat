# syntax=docker/dockerfile:1.4
FROM node:18-alpine

WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Install dependencies with BuildKit cache mount and frozen lockfile
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy only necessary files for the auth service
# This reduces the context size and improves build time
COPY tsconfig.json nest-cli.json ./
COPY apps/auth-service ./apps/auth-service
COPY libs ./libs

# Expose port
EXPOSE 4002

# Start the application
CMD ["pnpm", "run", "start:debug", "auth-service"]
