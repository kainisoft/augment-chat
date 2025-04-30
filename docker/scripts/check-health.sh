#!/bin/bash
set -e

# This script checks the health status of all services in the chat application

# Function to print colored output
print_status() {
  local service=$1
  local status=$2
  
  if [ "$status" == "healthy" ]; then
    echo -e "\033[0;32m✓ $service is $status\033[0m"
  elif [ "$status" == "starting" ]; then
    echo -e "\033[0;33m⟳ $service is $status\033[0m"
  else
    echo -e "\033[0;31m✗ $service is $status\033[0m"
  fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker first."
  exit 1
fi

echo "Checking health status of all services..."
echo "----------------------------------------"

# Get all running containers for the project
containers=$(docker ps --filter "name=pet6-" --format "{{.Names}}")

if [ -z "$containers" ]; then
  echo "No services are currently running. Use './docker/scripts/dev.sh' to start services."
  exit 1
fi

# Check health status for each container
for container in $containers; do
  # Extract service name from container name (remove pet6- prefix)
  service=${container#pet6-}
  
  # Get health status
  status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
  
  # Print status
  print_status "$service" "$status"
done

echo "----------------------------------------"

# Check Kafka topics if Kafka is running
if docker ps | grep -q "pet6-kafka-1"; then
  echo "Checking Kafka topics..."
  echo "----------------------------------------"
  
  # List Kafka topics
  topics=$(docker exec -it pet6-kafka-1 bash -c "kafka-topics --list --bootstrap-server localhost:9092" 2>/dev/null || echo "Failed to list topics")
  
  if [ "$topics" == "Failed to list topics" ]; then
    echo -e "\033[0;31m✗ Failed to list Kafka topics\033[0m"
  else
    echo "Available Kafka topics:"
    echo "$topics" | while read -r topic; do
      if [ -n "$topic" ]; then
        echo -e "\033[0;32m✓ $topic\033[0m"
      fi
    done
  fi
fi

echo "----------------------------------------"
echo "Health check completed."
