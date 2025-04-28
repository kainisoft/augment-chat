#!/bin/bash

# Docker development helper script
# This script provides shortcuts for common Docker development tasks

# Set BuildKit environment variable
export DOCKER_BUILDKIT=1

# Function to display help message
show_help() {
  echo "Docker Development Helper Script"
  echo ""
  echo "Usage: ./dev.sh [command]"
  echo ""
  echo "Commands:"
  echo "  db          Start only database services (PostgreSQL, MongoDB)"
  echo "  kafka       Start Kafka and Zookeeper"
  echo "  redis       Start Redis cluster"
  echo "  infra       Start all infrastructure services (db, kafka, redis)"
  echo "  auth        Start auth service with dependencies"
  echo "  user        Start user service with dependencies"
  echo "  chat        Start chat service with dependencies"
  echo "  notification Start notification service with dependencies"
  echo "  api         Start API gateway with dependencies"
  echo "  all         Start all services"
  echo "  build       Rebuild all services"
  echo "  build:auth  Rebuild auth service"
  echo "  build:user  Rebuild user service"
  echo "  build:chat  Rebuild chat service"
  echo "  build:notification Rebuild notification service"
  echo "  build:api   Rebuild API gateway"
  echo "  down        Stop all services"
  echo "  clean       Stop all services and remove volumes"
  echo "  logs [service] Show logs for a specific service"
  echo "  stats       Show resource usage statistics"
  echo "  help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./dev.sh infra      # Start all infrastructure services"
  echo "  ./dev.sh auth       # Start auth service with dependencies"
  echo "  ./dev.sh logs auth  # Show logs for auth service"
}

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Error: docker-compose is not installed"
  exit 1
fi

# Use optimized docker-compose file
COMPOSE_FILE="docker-compose.optimized.yml"

# Check if the optimized docker-compose file exists
if [ ! -f "../$COMPOSE_FILE" ]; then
  echo "Error: $COMPOSE_FILE not found"
  exit 1
fi

# Process commands
case "$1" in
  db)
    echo "Starting database services..."
    docker-compose -f "../$COMPOSE_FILE" --profile db up -d
    ;;
  kafka)
    echo "Starting Kafka and Zookeeper..."
    docker-compose -f "../$COMPOSE_FILE" --profile kafka up -d
    ;;
  redis)
    echo "Starting Redis cluster..."
    docker-compose -f "../$COMPOSE_FILE" --profile redis up -d
    ;;
  infra)
    echo "Starting all infrastructure services..."
    docker-compose -f "../$COMPOSE_FILE" --profile db --profile kafka --profile redis up -d
    ;;
  auth)
    echo "Starting auth service with dependencies..."
    docker-compose -f "../$COMPOSE_FILE" --profile auth up -d
    ;;
  user)
    echo "Starting user service with dependencies..."
    docker-compose -f "../$COMPOSE_FILE" --profile user up -d
    ;;
  chat)
    echo "Starting chat service with dependencies..."
    docker-compose -f "../$COMPOSE_FILE" --profile chat up -d
    ;;
  notification)
    echo "Starting notification service with dependencies..."
    docker-compose -f "../$COMPOSE_FILE" --profile notification up -d
    ;;
  api)
    echo "Starting API gateway with dependencies..."
    docker-compose -f "../$COMPOSE_FILE" --profile api up -d
    ;;
  all)
    echo "Starting all services..."
    docker-compose -f "../$COMPOSE_FILE" --profile all up -d
    ;;
  build)
    echo "Rebuilding all services..."
    docker-compose -f "../$COMPOSE_FILE" build
    ;;
  build:auth)
    echo "Rebuilding auth service..."
    docker-compose -f "../$COMPOSE_FILE" build auth-service
    ;;
  build:user)
    echo "Rebuilding user service..."
    docker-compose -f "../$COMPOSE_FILE" build user-service
    ;;
  build:chat)
    echo "Rebuilding chat service..."
    docker-compose -f "../$COMPOSE_FILE" build chat-service
    ;;
  build:notification)
    echo "Rebuilding notification service..."
    docker-compose -f "../$COMPOSE_FILE" build notification-service
    ;;
  build:api)
    echo "Rebuilding API gateway..."
    docker-compose -f "../$COMPOSE_FILE" build api-gateway
    ;;
  down)
    echo "Stopping all services..."
    docker-compose -f "../$COMPOSE_FILE" down
    ;;
  clean)
    echo "Stopping all services and removing volumes..."
    docker-compose -f "../$COMPOSE_FILE" down -v
    ;;
  logs)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service name"
      exit 1
    fi
    echo "Showing logs for $2 service..."
    docker-compose -f "../$COMPOSE_FILE" logs -f "$2"
    ;;
  stats)
    echo "Showing resource usage statistics..."
    docker stats
    ;;
  help|*)
    show_help
    ;;
esac

exit 0
