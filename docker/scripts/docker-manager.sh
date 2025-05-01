#!/bin/bash

# Docker Container Manager Script
# This script provides advanced container management for the project

# Set BuildKit environment variable
export DOCKER_BUILDKIT=1

# Function to display help message
show_help() {
  echo "Docker Container Manager Script"
  echo ""
  echo "Usage: ./docker-manager.sh [command]"
  echo ""
  echo "Commands:"
  echo "  status              Show status of all containers"
  echo "  status:project      Show only containers for this project"
  echo "  stop:all            Stop all running containers"
  echo "  stop:project        Stop all containers for this project"
  echo "  remove:all          Remove all stopped containers"
  echo "  remove:project      Remove all stopped containers for this project"
  echo "  cleanup:volumes     Remove all unused volumes"
  echo "  cleanup:images      Remove all dangling images"
  echo "  cleanup:all         Remove all unused containers, volumes, and networks"
  echo "  prune:system        Prune the entire Docker system (use with caution)"
  echo "  restart:container [name] Restart a specific container"
  echo "  logs:container [name]    Show logs for a specific container"
  echo "  inspect:container [name] Inspect a specific container"
  echo "  help                Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./docker-manager.sh status:project    # Show status of all project containers"
  echo "  ./docker-manager.sh stop:project      # Stop all project containers"
  echo "  ./docker-manager.sh restart:container pet6-logging-service-1  # Restart logging service"
}

# Check if docker is available
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not available"
  echo "Please install Docker"
  exit 1
fi

# Get the project name (based on the current directory name)
PROJECT_NAME=$(basename $(cd "$(dirname "$0")/../.." && pwd))
echo "Project name: $PROJECT_NAME"

# Process commands
case "$1" in
  status)
    echo "Showing status of all containers..."
    docker ps -a
    ;;
  status:project)
    echo "Showing status of all containers for project $PROJECT_NAME..."
    docker ps -a --filter "name=${PROJECT_NAME}"
    ;;
  stop:all)
    echo "Stopping all running containers..."
    CONTAINERS=$(docker ps -q)
    if [ -n "$CONTAINERS" ]; then
      docker stop $CONTAINERS
      echo "All containers stopped."
    else
      echo "No running containers found."
    fi
    ;;
  stop:project)
    echo "Stopping all containers for project $PROJECT_NAME..."
    CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" -q)
    if [ -n "$CONTAINERS" ]; then
      docker stop $CONTAINERS
      echo "All project containers stopped."
    else
      echo "No running containers found for project $PROJECT_NAME."
    fi
    ;;
  remove:all)
    echo "Removing all stopped containers..."
    CONTAINERS=$(docker ps -a -q -f status=exited)
    if [ -n "$CONTAINERS" ]; then
      docker rm $CONTAINERS
      echo "All stopped containers removed."
    else
      echo "No stopped containers found."
    fi
    ;;
  remove:project)
    echo "Removing all stopped containers for project $PROJECT_NAME..."
    CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" -q -f status=exited)
    if [ -n "$CONTAINERS" ]; then
      docker rm $CONTAINERS
      echo "All stopped project containers removed."
    else
      echo "No stopped containers found for project $PROJECT_NAME."
    fi
    ;;
  cleanup:volumes)
    echo "Removing all unused volumes..."
    docker volume prune -f
    ;;
  cleanup:images)
    echo "Removing all dangling images..."
    docker image prune -f
    ;;
  cleanup:all)
    echo "Removing all unused containers, volumes, and networks..."
    docker system prune -f
    ;;
  prune:system)
    echo "WARNING: This will remove all unused containers, volumes, networks, and images!"
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker system prune -a -f --volumes
    fi
    ;;
  restart:container)
    if [ -z "$2" ]; then
      echo "Error: Please specify a container name"
      exit 1
    fi
    echo "Restarting container $2..."
    docker restart $2
    ;;
  logs:container)
    if [ -z "$2" ]; then
      echo "Error: Please specify a container name"
      exit 1
    fi
    echo "Showing logs for container $2..."
    docker logs -f $2
    ;;
  inspect:container)
    if [ -z "$2" ]; then
      echo "Error: Please specify a container name"
      exit 1
    fi
    echo "Inspecting container $2..."
    docker inspect $2
    ;;
  help|*)
    show_help
    ;;
esac

exit 0
