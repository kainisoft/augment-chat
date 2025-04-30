# Kafka Setup and Usage

This document provides information about the Kafka setup in the chat application and how to use it.

## Overview

Kafka is used as the message broker for communication between microservices in the chat application. It provides a reliable, scalable, and fault-tolerant way for services to exchange events.

## Architecture

The Kafka setup consists of:

- **Zookeeper**: Used for managing Kafka cluster state
- **Kafka Broker**: The actual message broker service
- **Topics**: Logical channels for message exchange between services

## Topics

The following Kafka topics are configured:

| Topic | Purpose | Partitions | Replication Factor |
|-------|---------|------------|-------------------|
| auth-events | Authentication events | 3 | 1 |
| user-events | User-related events | 3 | 1 |
| chat-events | Chat-related events | 3 | 1 |
| notification-events | Notification events | 3 | 1 |
| logs | Centralized logging | 10 | 1 |

The `logs` topic has additional configuration:
- Cleanup policy: delete
- Retention period: 7 days (604800000 ms)
- Compression: lz4

## Starting Kafka

To start Kafka and Zookeeper:

```bash
./docker/scripts/dev.sh kafka
```

This will start both Zookeeper and Kafka containers with the proper configuration.

## Initializing Kafka Topics

To create the Kafka topics:

```bash
./docker/scripts/kafka-init.sh
```

This script will:
1. Check if Kafka is running
2. Wait for Kafka to be healthy
3. Create all the required topics with the proper configuration

## Checking Kafka Health

To check the health status of Kafka and other services:

```bash
./docker/scripts/check-health.sh
```

or

```bash
./docker/scripts/dev.sh health
```

This will show the health status of all running services and list the available Kafka topics.

## Connecting to Kafka

Services can connect to Kafka using the following addresses:

- From host machine: `localhost:9092`
- From Docker containers: `kafka:29092`

## Dependency Configuration

All services that depend on Kafka are configured to wait for Kafka to be healthy before starting. This ensures that the services can connect to Kafka when they start.

## Troubleshooting

If you encounter issues with Kafka:

1. Check the Kafka logs:
   ```bash
   docker logs pet6-kafka-1
   ```

2. Check the Zookeeper logs:
   ```bash
   docker logs pet6-zookeeper-1
   ```

3. Verify that Kafka is healthy:
   ```bash
   ./docker/scripts/check-health.sh
   ```

4. Restart Kafka if needed:
   ```bash
   docker compose down
   ./docker/scripts/dev.sh kafka
   ```

5. Recreate the topics if needed:
   ```bash
   ./docker/scripts/kafka-init.sh
   ```
