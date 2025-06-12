#!/bin/bash

# Frontend Docker Setup Test Script
# This script tests the Docker setup for the Next.js frontend

set -e

echo "🧪 Testing Frontend Docker Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    
    if docker ps | grep -q "$service_name"; then
        print_status "success" "$service_name is running"
        
        # Check if port is accessible
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            print_status "success" "$service_name is accessible on port $port"
        else
            print_status "warning" "$service_name is running but port $port is not accessible yet"
        fi
    else
        print_status "error" "$service_name is not running"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "info" "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            print_status "success" "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_status "error" "$service_name failed to start within expected time"
    return 1
}

# Test 1: Check if Docker and Docker Compose are available
echo "🔍 Checking prerequisites..."
if command -v docker &> /dev/null; then
    print_status "success" "Docker is installed"
else
    print_status "error" "Docker is not installed"
    exit 1
fi

if docker compose version &> /dev/null; then
    print_status "success" "Docker Compose V2 is available"
elif command -v docker-compose &> /dev/null; then
    print_status "success" "Docker Compose V1 is available"
else
    print_status "error" "Docker Compose is not available"
    exit 1
fi

# Test 2: Check if required files exist
echo ""
echo "📁 Checking required files..."
required_files=(
    "docker-compose.yml"
    "docker/Dockerfiles/nextjs-chat.Dockerfile"
    "docker/config/nextjs-chat/nextjs-chat.env"
    "client/web/nextjs/package.json"
    "client/web/nextjs/apps/chat/package.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "success" "$file exists"
    else
        print_status "error" "$file is missing"
        exit 1
    fi
done

# Test 3: Start infrastructure services
echo ""
echo "🏗️  Starting infrastructure services..."
./docker/scripts/dev.sh infra

# Wait a bit for infrastructure to start
sleep 10

# Test 4: Start backend services
echo ""
echo "🔧 Starting backend services..."
./docker/scripts/dev.sh api &
./docker/scripts/dev.sh websocket &

# Wait for backend services
sleep 15

# Test 5: Check backend services
echo ""
echo "🔍 Checking backend services..."
check_service "api-gateway" "4000"
check_service "websocket-gateway" "4001"

# Test 6: Start frontend service
echo ""
echo "🎨 Starting frontend service..."
./docker/scripts/dev.sh frontend

# Test 7: Wait for frontend to be ready
echo ""
echo "⏳ Waiting for frontend to be ready..."
wait_for_service "nextjs-chat" "5000"

# Test 8: Test frontend accessibility
echo ""
echo "🌐 Testing frontend accessibility..."
if curl -s "http://localhost:5100" | grep -q "html"; then
    print_status "success" "Frontend is serving HTML content"
else
    print_status "error" "Frontend is not serving expected content"
fi

# Test 9: Test backend connectivity from frontend perspective
echo ""
echo "🔗 Testing backend connectivity..."
if curl -s "http://localhost:4000/graphql" > /dev/null 2>&1; then
    print_status "success" "GraphQL endpoint is accessible"
else
    print_status "warning" "GraphQL endpoint is not accessible"
fi

# Test 10: Check Docker network
echo ""
echo "🌐 Checking Docker network..."
if docker network ls | grep -q "chat-network"; then
    print_status "success" "chat-network exists"
else
    print_status "error" "chat-network is missing"
fi

# Test 11: Check volumes
echo ""
echo "💾 Checking Docker volumes..."
if docker volume ls | grep -q "nextjs-chat-node-modules"; then
    print_status "success" "nextjs-chat-node-modules volume exists"
else
    print_status "warning" "nextjs-chat-node-modules volume is missing"
fi

# Final status
echo ""
echo "📊 Test Summary"
echo "==============="
print_status "info" "Frontend URL: http://localhost:5100"
print_status "info" "Docs URL: http://localhost:5101"
print_status "info" "GraphQL Playground: http://localhost:4000/graphql"
print_status "info" "Grafana: http://localhost:3001"

echo ""
print_status "success" "Frontend Docker setup test completed!"
print_status "info" "You can now start developing with the containerized frontend"

echo ""
echo "🚀 Next steps:"
echo "   1. Open http://localhost:5100 in your browser"
echo "   2. Start coding in client/web/nextjs/apps/chat/"
echo "   3. Changes will be automatically reloaded"
echo ""
echo "📚 For more information, see docker/README-FRONTEND.md"
