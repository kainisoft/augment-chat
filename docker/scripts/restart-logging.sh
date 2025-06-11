#!/bin/bash

# Script to restart the logging system
# This is useful when you need to apply configuration changes

# Set BuildKit environment variable
export DOCKER_BUILDKIT=1

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

# Use standard docker-compose file
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

# Stop the logging services
echo "Stopping logging services..."
$DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile logging down

# Start the logging services
echo "Starting logging services..."
$DOCKER_COMPOSE -f "$COMPOSE_PATH" --profile logging up -d

# Show the status
echo "Logging services status:"
$DOCKER_COMPOSE -f "$COMPOSE_PATH" ps loki grafana logging-service

echo "Logging system has been restarted."
echo "Grafana UI is available at: http://localhost:3000"
echo "Loki API is available at: http://localhost:3100"
echo "Logging Service API is available at: http://localhost:4006"

exit 0
