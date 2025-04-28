#!/bin/bash

# Database seeding script for Docker environment
# This script provides commands for seeding test data into databases

# Function to display help message
show_help() {
  echo "Database Seeding Script"
  echo ""
  echo "Usage: ./db-seed.sh [command] [service]"
  echo ""
  echo "Commands:"
  echo "  run [service]      Seed database for a specific service"
  echo "  clear [service]    Clear seeded data for a specific service"
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
  echo "  ./db-seed.sh run auth      # Seed data for auth service"
  echo "  ./db-seed.sh clear user    # Clear seeded data for user service"
  echo "  ./db-seed.sh run all       # Seed data for all services"
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Function to seed PostgreSQL database
seed_postgres() {
  local service=$1
  local db_name="${service}_db"
  
  echo "Seeding data for $service service (PostgreSQL)..."
  
  # Create a temporary container to run seed
  docker run --rm \
    --network=pet6_chat-network \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run seed:run $service"
}

# Function to clear PostgreSQL database
clear_postgres() {
  local service=$1
  local db_name="${service}_db"
  
  echo "Clearing seeded data for $service service (PostgreSQL)..."
  
  # Create a temporary container to run clear
  docker run --rm \
    --network=pet6_chat-network \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run seed:clear $service"
}

# Function to seed MongoDB database
seed_mongo() {
  local service=$1
  local db_name="${service}_db"
  
  echo "Seeding data for $service service (MongoDB)..."
  
  # Create a temporary container to run seed
  docker run --rm \
    --network=pet6_chat-network \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run seed:run $service"
}

# Function to clear MongoDB database
clear_mongo() {
  local service=$1
  local db_name="${service}_db"
  
  echo "Clearing seeded data for $service service (MongoDB)..."
  
  # Create a temporary container to run clear
  docker run --rm \
    --network=pet6_chat-network \
    -v "$PROJECT_ROOT/server:/app" \
    -w /app \
    node:18-alpine \
    sh -c "npm install -g pnpm && pnpm install && pnpm run seed:clear $service"
}

# Check if the first argument is provided
if [ -z "$1" ]; then
  show_help
  exit 1
fi

# Process commands
case "$1" in
  run)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service"
      exit 1
    fi
    
    case "$2" in
      auth|user)
        seed_postgres $2
        ;;
      chat|notification)
        seed_mongo $2
        ;;
      all)
        seed_postgres "auth"
        seed_postgres "user"
        seed_mongo "chat"
        seed_mongo "notification"
        ;;
      *)
        echo "Error: Unknown service $2"
        exit 1
        ;;
    esac
    ;;
    
  clear)
    if [ -z "$2" ]; then
      echo "Error: Please specify a service"
      exit 1
    fi
    
    case "$2" in
      auth|user)
        clear_postgres $2
        ;;
      chat|notification)
        clear_mongo $2
        ;;
      all)
        clear_postgres "auth"
        clear_postgres "user"
        clear_mongo "chat"
        clear_mongo "notification"
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
