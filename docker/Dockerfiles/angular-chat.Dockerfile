# syntax=docker/dockerfile:1.4
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Copy package files for dependency installation
COPY client/web/angular/package.json client/web/angular/pnpm-lock.yaml ./

# Install dependencies with BuildKit cache mount (no frozen lockfile for development)
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --no-frozen-lockfile

# Copy Angular configuration files
COPY client/web/angular/angular.json ./
COPY client/web/angular/tsconfig.json ./
COPY client/web/angular/tailwind.config.js ./

# Copy source code
COPY client/web/angular/projects ./projects

# Expose port for Angular development server
EXPOSE 5200

# Start the Angular development server
CMD ["pnpm", "ng", "serve", "chat", "--host", "0.0.0.0", "--port", "5200", "--poll", "2000"]
