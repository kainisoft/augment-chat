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

# List created topics
echo "Listing topics:"
kafka-topics --list --bootstrap-server kafka:29092

echo "Kafka topics created successfully"
