# syntax=docker/dockerfile:1.4
FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY client/web/angular/projects/example/package.json client/web/angular/projects/example/package-lock.json ./

# Install dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Copy Angular configuration files
COPY client/web/angular/projects/example/angular.json ./
COPY client/web/angular/projects/example/tsconfig.json ./
COPY client/web/angular/projects/example/tsconfig.app.json ./
COPY client/web/angular/projects/example/tailwind.config.js ./
COPY client/web/angular/projects/example/transloco.config.js ./

# Copy source code
COPY client/web/angular/projects/example/src ./src
COPY client/web/angular/projects/example/public ./public

# Expose port for Angular development server
EXPOSE 5201

# Start the Angular development server
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "5201", "--poll", "2000"]
