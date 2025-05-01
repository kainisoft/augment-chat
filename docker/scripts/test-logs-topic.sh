#!/bin/bash
set -e

# This script tests the Kafka logs topic by sending sample log messages

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

# Check if Kafka is running
echo "Checking if Kafka is running..."
if ! docker exec pet6-kafka-1 kafka-topics --list --bootstrap-server localhost:9092 &> /dev/null; then
  echo "Error: Kafka is not running. Please start Kafka first with '$DOCKER_COMPOSE -f docker-compose.yml --profile kafka up -d'"
  exit 1
fi

# Check if logs topic exists
echo "Checking if logs topic exists..."
if ! docker exec pet6-kafka-1 kafka-topics --list --bootstrap-server localhost:9092 | grep -q "^logs$"; then
  echo "Creating logs topic..."
  docker exec pet6-kafka-1 kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 10 --replication-factor 1 --topic logs \
    --config cleanup.policy=delete \
    --config retention.ms=604800000 \
    --config compression.type=lz4
fi

# Send sample log messages
echo "Sending sample log messages to logs topic..."

# Sample log message from API Gateway
API_GATEWAY_LOG='{
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
  "level": "info",
  "service": "api-gateway",
  "message": "Request received",
  "context": "RequestController",
  "requestId": "req-'$(uuidgen | tr -d '-')'",
  "method": "GET",
  "path": "/api/users",
  "responseTime": 45
}'

# Sample log message from Auth Service
AUTH_SERVICE_LOG='{
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
  "level": "info",
  "service": "auth-service",
  "message": "User authenticated successfully",
  "context": "AuthController",
  "requestId": "req-'$(uuidgen | tr -d '-')'",
  "userId": "user-'$(uuidgen | tr -d '-')'"
}'

# Sample log message from Chat Service
CHAT_SERVICE_LOG='{
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
  "level": "debug",
  "service": "chat-service",
  "message": "Message sent to conversation",
  "context": "ChatController",
  "requestId": "req-'$(uuidgen | tr -d '-')'",
  "userId": "user-'$(uuidgen | tr -d '-')'",
  "conversationId": "conv-'$(uuidgen | tr -d '-')'",
  "messageId": "msg-'$(uuidgen | tr -d '-')'"
}'

# Sample error log
ERROR_LOG='{
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'",
  "level": "error",
  "service": "user-service",
  "message": "Failed to update user profile",
  "context": "UserController",
  "requestId": "req-'$(uuidgen | tr -d '-')'",
  "userId": "user-'$(uuidgen | tr -d '-')'",
  "error": "Database connection error",
  "stack": "Error: Database connection error\n    at UserService.updateProfile (/app/src/user/user.service.ts:42:11)"
}'

# Send the log messages to Kafka
echo "Sending API Gateway log..."
API_GATEWAY_LOG_ONELINE=$(echo "$API_GATEWAY_LOG" | tr -d '\n')
echo "api-gateway:$API_GATEWAY_LOG_ONELINE" | docker exec -i pet6-kafka-1 kafka-console-producer --broker-list localhost:9092 --topic logs --property "parse.key=true" --property "key.separator=:"

echo "Sending Auth Service log..."
AUTH_SERVICE_LOG_ONELINE=$(echo "$AUTH_SERVICE_LOG" | tr -d '\n')
echo "auth-service:$AUTH_SERVICE_LOG_ONELINE" | docker exec -i pet6-kafka-1 kafka-console-producer --broker-list localhost:9092 --topic logs --property "parse.key=true" --property "key.separator=:"

echo "Sending Chat Service log..."
CHAT_SERVICE_LOG_ONELINE=$(echo "$CHAT_SERVICE_LOG" | tr -d '\n')
echo "chat-service:$CHAT_SERVICE_LOG_ONELINE" | docker exec -i pet6-kafka-1 kafka-console-producer --broker-list localhost:9092 --topic logs --property "parse.key=true" --property "key.separator=:"

echo "Sending Error log..."
ERROR_LOG_ONELINE=$(echo "$ERROR_LOG" | tr -d '\n')
echo "user-service:$ERROR_LOG_ONELINE" | docker exec -i pet6-kafka-1 kafka-console-producer --broker-list localhost:9092 --topic logs --property "parse.key=true" --property "key.separator=:"

echo "Sample log messages sent successfully!"
echo ""
echo "To consume messages from the logs topic, run:"
echo "docker exec pet6-kafka-1 kafka-console-consumer --bootstrap-server localhost:9092 --topic logs --from-beginning"
