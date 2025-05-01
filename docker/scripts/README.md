# Docker Management Scripts

This directory contains scripts to help manage Docker containers for the project.

## dev.sh

The main development script for starting and stopping services with proper profiles.

### Usage

```bash
./dev.sh [command]
```

### Commands

- `db` - Start only database services (PostgreSQL, MongoDB)
- `kafka` - Start Kafka and Zookeeper
- `redis` - Start Redis cluster
- `logging` - Start Loki, Grafana, and Logging Service (with Kafka)
- `infra` - Start all infrastructure services (db, kafka, redis, logging)
- `auth` - Start auth service with dependencies
- `user` - Start user service with dependencies
- `chat` - Start chat service with dependencies
- `notification` - Start notification service with dependencies
- `api` - Start API gateway with dependencies
- `all` - Start all services
- `build` - Rebuild all services
- `build:auth` - Rebuild auth service
- `build:user` - Rebuild user service
- `build:chat` - Rebuild chat service
- `build:notification` - Rebuild notification service
- `build:api` - Rebuild API gateway
- `down` - Stop all services (using all profiles)
- `down:all` - Forcefully stop all project containers
- `clean` - Stop all services and remove volumes
- `logs [service]` - Show logs for a specific service
- `stats` - Show resource usage statistics
- `status` - Show status of all services
- `status:logging` - Show status of logging services
- `health` - Check health status of all services

### Examples

```bash
./dev.sh infra      # Start all infrastructure services
./dev.sh auth       # Start auth service with dependencies
./dev.sh logs auth  # Show logs for auth service
./dev.sh down       # Stop all services
```

## docker-manager.sh

Advanced container management script for more granular control over Docker containers.

### Usage

```bash
./docker-manager.sh [command]
```

### Commands

- `status` - Show status of all containers
- `status:project` - Show only containers for this project
- `stop:all` - Stop all running containers
- `stop:project` - Stop all containers for this project
- `remove:all` - Remove all stopped containers
- `remove:project` - Remove all stopped containers for this project
- `cleanup:volumes` - Remove all unused volumes
- `cleanup:images` - Remove all dangling images
- `cleanup:all` - Remove all unused containers, volumes, and networks
- `prune:system` - Prune the entire Docker system (use with caution)
- `restart:container [name]` - Restart a specific container
- `logs:container [name]` - Show logs for a specific container
- `inspect:container [name]` - Inspect a specific container

### Examples

```bash
./docker-manager.sh status:project    # Show status of all project containers
./docker-manager.sh stop:project      # Stop all project containers
./docker-manager.sh restart:container pet6-logging-service-1  # Restart logging service
```

## Troubleshooting

### "docker compose down" doesn't stop all containers

This happens because Docker Compose only stops containers that were started with the same profiles. Use one of these solutions:

1. Use the enhanced `down` command in `dev.sh`:
   ```bash
   ./dev.sh down
   ```

2. Use the forceful stop command:
   ```bash
   ./dev.sh down:all
   ```

3. Use the docker-manager script:
   ```bash
   ./docker-manager.sh stop:project
   ```

### Containers from other projects are still running

If you have containers from other projects running and want to stop them:

```bash
./docker-manager.sh stop:all
```

Or to stop only specific containers:

```bash
docker stop container_name1 container_name2
```
