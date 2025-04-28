#!/bin/bash

# Database migration script for Docker environment
# This script provides commands for running database migrations

# Function to display help message
show_help() {
  echo "Database Migration Script"
  echo ""
  echo "Usage: ./db-migrate.sh [command] [service]"
  echo ""
  echo "Commands:"
  echo "  up [service]       Run migrations up for a specific service"
  echo "  down [service]     Rollback migrations for a specific service"
  echo "  create [service]   Create a new migration for a specific service"
  echo "  status [service]   Check migration status for a specific service"
  echo "  help               Show this help message"
  echo ""
  echo "Services:"
  echo "  auth               Auth service (PostgreSQL)"
  echo "  user               User service (PostgreSQL)"
  echo "  chat               Chat service (MongoDB)"
  echo "  notification       Notification service (MongoDB)"
  echo "  all                All services"
  echo ""
  echo "Examples:"
  echo "  ./db-migrate.sh up auth      # Run migrations for auth service"
  echo "  ./db-migrate.sh down user    # Rollback migrations for user service"
  echo "  ./db-migrate.sh create auth  # Create a new migration for auth service"
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Function to run PostgreSQL migrations
run_postgres_migration() {
  local service=$1
  local command=$2
  local db_name="${service}_db"
  
  echo "Running $command migrations for $service service (PostgreSQL)..."
  
  # Create a temporary container to run migrations
  docker run --rm \
    --network=pet6_chat-network \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run migration:$command $service"
}

# Function to run MongoDB migrations
run_mongo_migration() {
  local service=$1
  local command=$2
  local db_name="${service}_db"
  
  echo "Running $command migrations for $service service (MongoDB)..."
  
  # Create a temporary container to run migrations
  docker run --rm \
    --network=pet6_chat-network \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run migration:$command $service"
}

# Function to create a new migration
create_migration() {
  local service=$1
  local migration_name=$2
  
  if [ -z "$migration_name" ]; then
    echo "Error: Please provide a name for the migration"
    echo "Usage: ./db-migrate.sh create $service <migration_name>"
    exit 1
  fi
  
  echo "Creating new migration for $service service..."
  
  # Create a temporary container to create migration
  docker run --rm \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run migration:create $service $migration_name"
}

# Check if the first argument is provided
if [ -z "$1" ]; then
  show_help
  exit 1
fi

# Process commands
case "$1" in
  up)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service"
      exit 1
    fi
    
    case "$2" in
      auth|user)
        run_postgres_migration $2 "up"
        ;;
      chat|notification)
        run_mongo_migration $2 "up"
        ;;
      all)
        run_postgres_migration "auth" "up"
        run_postgres_migration "user" "up"
        run_mongo_migration "chat" "up"
        run_mongo_migration "notification" "up"
        ;;
      *)
        echo "Error: Unknown service $2"
        exit 1
        ;;
    esac
    ;;
    
  down)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service"
      exit 1
    fi
    
    case "$2" in
      auth|user)
        run_postgres_migration $2 "down"
        ;;
      chat|notification)
        run_mongo_migration $2 "down"
        ;;
      all)
        run_postgres_migration "auth" "down"
        run_postgres_migration "user" "down"
        run_mongo_migration "chat" "down"
        run_mongo_migration "notification" "down"
        ;;
      *)
        echo "Error: Unknown service $2"
        exit 1
        ;;
    esac
    ;;
    
  create)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service"
      exit 1
    fi
    
    case "$2" in
      auth|user|chat|notification)
        create_migration $2 "$3"
        ;;
      *)
        echo "Error: Unknown service $2"
        exit 1
        ;;
    esac
    ;;
    
  status)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service"
      exit 1
    fi
    
    case "$2" in
      auth|user)
        run_postgres_migration $2 "status"
        ;;
      chat|notification)
        run_mongo_migration $2 "status"
        ;;
      all)
        run_postgres_migration "auth" "status"
        run_postgres_migration "user" "status"
        run_mongo_migration "chat" "status"
        run_mongo_migration "notification" "status"
        ;;
      *)
        echo "Error: Unknown service $2"
        exit 1
        ;;
    esac
    ;;
    
  help|*)
    show_help
    ;;
esac

exit 0
