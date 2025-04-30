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
  echo "  logging     Start Loki and Grafana logging system"
  echo "  infra       Start all infrastructure services (db, kafka, redis, logging)"
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
  echo "  status      Show status of all services"
  echo "  status:logging Show status of logging services"
  echo "  health      Check health status of all services"
  echo "  help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./dev.sh infra      # Start all infrastructure services"
  echo "  ./dev.sh auth       # Start auth service with dependencies"
  echo "  ./dev.sh logs auth  # Show logs for auth service"
}

# Check if docker compose (v2) or docker-compose (v1) is available
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
  # Docker Compose V2 is available (docker compose)
  DOCKER_COMPOSE="docker compose"
  echo "Using Docker Compose V2"
elif command -v docker-compose &> /dev/null; then
  # Docker Compose V1 is available (docker-compose)
  DOCKER_COMPOSE="docker-compose"
  echo "Using Docker Compose V1"
else
  echo "Error: Neither docker-compose nor docker compose is available"
  echo "Please install Docker and Docker Compose"
  exit 1
fi

# Use standard docker-compose file (which is now the optimized version)
COMPOSE_FILE="docker-compose.yml"

# Get the correct path to the docker-compose file
# If running from the docker/scripts directory, we need to go up two levels
# If running from the docker directory, we need to go up one level
# If running from the root directory, we use the file directly
if [ -f "../../$COMPOSE_FILE" ]; then
  COMPOSE_PATH="../../$COMPOSE_FILE"
elif [ -f "../$COMPOSE_FILE" ]; then
  COMPOSE_PATH="../$COMPOSE_FILE"
elif [ -f "$COMPOSE_FILE" ]; then
  COMPOSE_PATH="$COMPOSE_FILE"
else
  echo "Error: $COMPOSE_FILE not found"
  exit 1
fi

echo "Using Docker Compose file: $COMPOSE_PATH"

# Process commands
case "$1" in
  db)
    echo "Starting database services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile db up -d
    ;;
  kafka)
    echo "Starting Kafka and Zookeeper..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile kafka up -d
    ;;
  redis)
    echo "Starting Redis cluster..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile redis up -d
    ;;
  logging)
    echo "Starting logging system (Loki, Grafana, and Logging Service)..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile logging up -d
    ;;
  infra)
    echo "Starting all infrastructure services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile db --profile kafka --profile redis --profile logging up -d
    ;;
  auth)
    echo "Starting auth service with dependencies..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile auth up -d
    ;;
  user)
    echo "Starting user service with dependencies..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile user up -d
    ;;
  chat)
    echo "Starting chat service with dependencies..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile chat up -d
    ;;
  notification)
    echo "Starting notification service with dependencies..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile notification up -d
    ;;
  api)
    echo "Starting API gateway with dependencies..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile api up -d
    ;;
  all)
    echo "Starting all services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile all up -d
    ;;
  build)
    echo "Rebuilding all services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" build
    ;;
  build:auth)
    echo "Rebuilding auth service..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" build auth-service
    ;;
  build:user)
    echo "Rebuilding user service..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" build user-service
    ;;
  build:chat)
    echo "Rebuilding chat service..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" build chat-service
    ;;
  build:notification)
    echo "Rebuilding notification service..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" build notification-service
    ;;
  build:api)
    echo "Rebuilding API gateway..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" build api-gateway
    ;;
  down)
    echo "Stopping all services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" down
    ;;
  clean)
    echo "Stopping all services and removing volumes..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" down -v
    ;;
  logs)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service name"
      exit 1
    fi
    echo "Showing logs for $2 service..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" logs -f "$2"
    ;;
  stats)
    echo "Showing resource usage statistics..."
    docker stats
    ;;
  status)
    echo "Showing status of all services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" ps
    ;;
  status:logging)
    echo "Showing status of logging services..."
    $DOCKER_COMPOSE -f "$COMPOSE_PATH" ps loki grafana logging-service
    echo ""
    echo "Grafana UI: http://localhost:3001 (admin/admin)"
    echo "Loki API: http://localhost:3100"
    echo "Logging Service API: http://localhost:4005/health"
    ;;
  health)
    echo "Checking health status of all services..."
    ./docker/scripts/check-health.sh
    ;;
  help|*)
    show_help
    ;;
esac

exit 0
