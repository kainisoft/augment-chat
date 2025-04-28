#!/bin/bash

# Docker development helper script for HMR
# This script provides shortcuts for running services with Hot Module Replacement

# Set BuildKit environment variable
export DOCKER_BUILDKIT=1

# Function to display help message
show_help() {
  echo "Docker Development Helper Script with HMR"
  echo ""
  echo "Usage: ./hmr-dev.sh [command] [service]"
  echo ""
  echo "Commands:"
  echo "  build [service]   Build a specific service with HMR support"
  echo "  run [service]     Run a specific service with HMR support"
  echo "  stop [service]    Stop a specific service"
  echo "  logs [service]    Show logs for a specific service"
  echo "  clean             Remove all containers and volumes"
  echo "  help              Show this help message"
  echo ""
  echo "Services:"
  echo "  api-gateway       API Gateway service"
  echo "  auth-service      Authentication service"
  echo "  user-service      User service"
  echo "  chat-service      Chat service"
  echo "  notification-service  Notification service"
  echo ""
  echo "Examples:"
  echo "  ./hmr-dev.sh build auth-service   # Build auth service with HMR"
  echo "  ./hmr-dev.sh run auth-service     # Run auth service with HMR"
  echo "  ./hmr-dev.sh logs auth-service    # Show logs for auth service"
}

# Check if docker is installed
if ! command -v docker &> /dev/null; then
  echo "Error: docker is not installed"
  exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Function to build a service
build_service() {
  local service=$1
  echo "Building $service with HMR support..."
  docker build -t $service-hmr -f $PROJECT_ROOT/docker/Dockerfiles/$service.optimized.Dockerfile $PROJECT_ROOT/server
}

# Function to run a service
run_service() {
  local service=$1
  local port=$2
  local db_url=$3
  
  # Stop the service if it's already running
  docker stop $service-hmr 2>/dev/null || true
  docker rm $service-hmr 2>/dev/null || true
  
  echo "Running $service with HMR support..."
  
  # Set environment variables based on service
  local env_vars="-e NODE_ENV=development -e PORT=$port"
  if [ ! -z "$db_url" ]; then
    env_vars="$env_vars -e $db_url"
  fi
  
  # Run the container
  docker run -d --name $service-hmr -p $port:$port $env_vars \
    -v $PROJECT_ROOT/server/apps/$service:/app/apps/$service \
    -v $PROJECT_ROOT/server/libs:/app/libs \
    -v $PROJECT_ROOT/server/webpack-hmr.config.js:/app/webpack-hmr.config.js \
    $service-hmr
  
  # Show logs
  docker logs -f $service-hmr
}

# Process commands
case "$1" in
  build)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service name"
      exit 1
    fi
    build_service $2
    ;;
  run)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service name"
      exit 1
    fi
    
    # Set port and database URL based on service
    case "$2" in
      api-gateway)
        run_service $2 4000 ""
        ;;
      auth-service)
        run_service $2 4001 "DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/auth_db"
        ;;
      user-service)
        run_service $2 4002 "DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/user_db"
        ;;
      chat-service)
        run_service $2 4003 "MONGODB_URI=mongodb://mongo:mongo@host.docker.internal:27017/chat_db?authSource=admin"
        ;;
      notification-service)
        run_service $2 4004 "MONGODB_URI=mongodb://mongo:mongo@host.docker.internal:27017/notification_db?authSource=admin"
        ;;
      *)
        echo "Error: Unknown service $2"
        exit 1
        ;;
    esac
    ;;
  stop)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service name"
      exit 1
    fi
    echo "Stopping $2..."
    docker stop $2-hmr
    ;;
  logs)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service name"
      exit 1
    fi
    echo "Showing logs for $2..."
    docker logs -f $2-hmr
    ;;
  clean)
    echo "Removing all HMR containers..."
    docker stop $(docker ps -a | grep -hmr | awk '{print $1}') 2>/dev/null || true
    docker rm $(docker ps -a | grep -hmr | awk '{print $1}') 2>/dev/null || true
    ;;
  help|*)
    show_help
    ;;
esac

exit 0
