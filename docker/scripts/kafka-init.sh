#!/bin/bash
set -e

# This script initializes Kafka topics for the chat application

echo "Starting Kafka initialization..."

# Check if Kafka is running
echo "Checking if Kafka is running..."
if ! docker ps | grep -q "pet6-kafka-1"; then
  echo "Error: Kafka is not running. Please start Kafka first with './docker/scripts/dev.sh kafka'"
  exit 1
fi

# Wait for Kafka to be healthy
echo "Waiting for Kafka to be healthy..."
max_retries=12  # 1 minute max wait time
retry_count=0

while ! docker ps | grep -q "pet6-kafka-1.*healthy"; do
  retry_count=$((retry_count+1))
  if [ $retry_count -ge $max_retries ]; then
    echo "Error: Kafka did not become healthy within the timeout period."
    echo "Please check the Kafka logs with 'docker logs pet6-kafka-1'"
    exit 1
  fi

  echo "Waiting for Kafka to become healthy... (attempt $retry_count/$max_retries)"
  sleep 5
done

echo "Kafka is healthy. Creating topics..."

# Create topics
echo "Creating auth-events topic..."
docker exec -it pet6-kafka-1 bash -c "kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic auth-events"

echo "Creating user-events topic..."
docker exec -it pet6-kafka-1 bash -c "kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic user-events"

echo "Creating chat-events topic..."
docker exec -it pet6-kafka-1 bash -c "kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic chat-events"

echo "Creating notification-events topic..."
docker exec -it pet6-kafka-1 bash -c "kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic notification-events"

echo "Creating logs topic for centralized logging..."
docker exec -it pet6-kafka-1 bash -c "kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 10 --replication-factor 1 --topic logs --config cleanup.policy=delete --config retention.ms=604800000 --config compression.type=lz4"

# List created topics
echo "Listing topics:"
docker exec -it pet6-kafka-1 bash -c "kafka-topics --list --bootstrap-server localhost:9092"

echo "Kafka topics created successfully"
