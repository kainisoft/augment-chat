# syntax=docker/dockerfile:1.4
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Copy package configuration files
COPY client/web/angular/package.json client/web/angular/pnpm-lock.yaml ./

# Install dependencies with BuildKit cache mount (no frozen lockfile for development)
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --no-frozen-lockfile

# Copy Angular workspace configuration
COPY client/web/angular/angular.json ./
COPY client/web/angular/tsconfig.json ./
COPY client/web/angular/tailwind.config.js ./
COPY client/web/angular/codegen.yml ./

# Copy projects directory (contains the actual Angular applications)
COPY client/web/angular/projects ./projects

# Expose port for Angular development server
EXPOSE 4200

# Set working directory to the Angular workspace
WORKDIR /app

# Install Angular CLI globally for development
RUN pnpm add -g @angular/cli

# Start the Angular development server for the chat project
CMD ["ng", "serve", "chat", "--host", "0.0.0.0", "--port", "4200"]
