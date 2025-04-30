#!/bin/bash
set -e

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
cub kafka-ready -b kafka:29092 1 30

# Create topics
echo "Creating Kafka topics..."
kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1 --topic auth-events
kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1 --topic user-events
kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1 --topic chat-events
kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --partitions 3 --replication-factor 1 --topic notification-events

# Create logs topic with appropriate partitioning and retention
echo "Creating logs topic for centralized logging..."
kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --partitions 10 --replication-factor 1 --topic logs \
  --config cleanup.policy=delete \
  --config retention.ms=604800000 \
  --config compression.type=lz4

# List created topics
echo "Listing topics:"
kafka-topics --list --bootstrap-server kafka:29092

echo "Kafka topics created successfully"
