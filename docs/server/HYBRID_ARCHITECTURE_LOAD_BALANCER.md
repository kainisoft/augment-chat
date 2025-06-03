# Hybrid Architecture Load Balancer Configuration

## Overview

This document provides load balancer configuration for the Hybrid API Gateway Architecture, supporting both HTTP traffic for Apollo Federation Gateway and WebSocket traffic for the WebSocket Gateway.

## Architecture Requirements

### Traffic Types
- **HTTP/HTTPS**: Apollo Federation Gateway (port 4000) - GraphQL queries and mutations
- **WebSocket/WSS**: WebSocket Gateway (port 4001) - GraphQL subscriptions
- **Health Checks**: Both gateways expose `/health` endpoints

### Load Balancer Features Required
- HTTP and WebSocket protocol support
- SSL/TLS termination
- Health check monitoring
- Session affinity for WebSocket connections
- Request routing based on path/protocol

## nginx Configuration

### Complete nginx.conf

```nginx
# /etc/nginx/nginx.conf

events {
    worker_connections 1024;
}

http {
    # Upstream configuration for Apollo Federation Gateway
    upstream apollo_federation_gateway {
        least_conn;
        server apollo-gateway-1:4000 max_fails=3 fail_timeout=30s;
        server apollo-gateway-2:4000 max_fails=3 fail_timeout=30s;
        server apollo-gateway-3:4000 max_fails=3 fail_timeout=30s;
    }

    # Upstream configuration for WebSocket Gateway
    upstream websocket_gateway {
        ip_hash; # Session affinity for WebSocket connections
        server websocket-gateway-1:4001 max_fails=3 fail_timeout=30s;
        server websocket-gateway-2:4001 max_fails=3 fail_timeout=30s;
        server websocket-gateway-3:4001 max_fails=3 fail_timeout=30s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=ws_limit:10m rate=5r/s;

    # Main server configuration
    server {
        listen 80;
        listen 443 ssl http2;
        server_name api.chatapp.com;

        # SSL Configuration
        ssl_certificate /etc/ssl/certs/chatapp.crt;
        ssl_certificate_key /etc/ssl/private/chatapp.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # CORS headers for GraphQL
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since" always;
        add_header Access-Control-Allow-Credentials true always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        # Apollo Federation Gateway (HTTP GraphQL)
        location /graphql {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://apollo_federation_gateway;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket Gateway (WebSocket GraphQL)
        location /ws {
            limit_req zone=ws_limit burst=10 nodelay;
            
            proxy_pass http://websocket_gateway;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket specific settings
            proxy_buffering off;
            proxy_cache off;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Server $host;
            
            # Longer timeouts for WebSocket connections
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }

        # Health check endpoints
        location /health {
            access_log off;
            proxy_pass http://apollo_federation_gateway;
            proxy_set_header Host $host;
        }

        location /ws/health {
            access_log off;
            proxy_pass http://websocket_gateway;
            proxy_set_header Host $host;
        }

        # Redirect HTTP to HTTPS
        if ($scheme != "https") {
            return 301 https://$server_name$request_uri;
        }
    }

    # Logging
    access_log /var/log/nginx/chatapp_access.log;
    error_log /var/log/nginx/chatapp_error.log;
}
```

### Health Check Configuration

```nginx
# Health check configuration for upstream monitoring
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    deny all;
}

# Custom health check script
location /health/check {
    access_log off;
    content_by_lua_block {
        local http = require "resty.http"
        local httpc = http.new()
        
        -- Check Apollo Federation Gateway
        local res1, err1 = httpc:request_uri("http://apollo_federation_gateway/health")
        local apollo_healthy = res1 and res1.status == 200
        
        -- Check WebSocket Gateway
        local res2, err2 = httpc:request_uri("http://websocket_gateway/health")
        local ws_healthy = res2 and res2.status == 200
        
        if apollo_healthy and ws_healthy then
            ngx.status = 200
            ngx.say("OK")
        else
            ngx.status = 503
            ngx.say("Service Unavailable")
        end
    }
}
```

## AWS Application Load Balancer (ALB) Configuration

### ALB with Target Groups

```yaml
# CloudFormation template for ALB setup
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Hybrid API Gateway Load Balancer'

Resources:
  # Application Load Balancer
  HybridAPILoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: hybrid-api-gateway-alb
      Scheme: internet-facing
      Type: application
      IpAddressType: ipv4
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # Target Group for Apollo Federation Gateway
  ApolloFederationTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: apollo-federation-tg
      Port: 4000
      Protocol: HTTP
      VpcId: !Ref VPC
      HealthCheckPath: /health
      HealthCheckProtocol: HTTP
      HealthCheckIntervalSeconds: 30
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3
      TargetType: ip

  # Target Group for WebSocket Gateway
  WebSocketTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: websocket-gateway-tg
      Port: 4001
      Protocol: HTTP
      VpcId: !Ref VPC
      HealthCheckPath: /health
      HealthCheckProtocol: HTTP
      HealthCheckIntervalSeconds: 30
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3
      TargetType: ip

  # HTTPS Listener
  HTTPSListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref ApolloFederationTargetGroup
      LoadBalancerArn: !Ref HybridAPILoadBalancer
      Port: 443
      Protocol: HTTPS
      Certificates:
        - CertificateArn: !Ref SSLCertificate

  # HTTP Listener (redirect to HTTPS)
  HTTPListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - Type: redirect
          RedirectConfig:
            Protocol: HTTPS
            Port: 443
            StatusCode: HTTP_301
      LoadBalancerArn: !Ref HybridAPILoadBalancer
      Port: 80
      Protocol: HTTP

  # Listener Rules for routing
  GraphQLRule:
    Type: AWS::ElasticLoadBalancingV2::ListenerRule
    Properties:
      Actions:
        - Type: forward
          TargetGroupArn: !Ref ApolloFederationTargetGroup
      Conditions:
        - Field: path-pattern
          Values: ['/graphql*']
      ListenerArn: !Ref HTTPSListener
      Priority: 100

  WebSocketRule:
    Type: AWS::ElasticLoadBalancingV2::ListenerRule
    Properties:
      Actions:
        - Type: forward
          TargetGroupArn: !Ref WebSocketTargetGroup
      Conditions:
        - Field: path-pattern
          Values: ['/ws*']
        - Field: http-header
          HttpHeaderConfig:
            HttpHeaderName: Upgrade
            Values: ['websocket']
      ListenerArn: !Ref HTTPSListener
      Priority: 200
```

## Docker Compose Load Balancer

### nginx + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - apollo-gateway-1
      - apollo-gateway-2
      - websocket-gateway-1
      - websocket-gateway-2
    networks:
      - api-network

  apollo-gateway-1:
    image: chatapp/apollo-gateway:latest
    environment:
      - PORT=4000
      - NODE_ENV=production
    networks:
      - api-network

  apollo-gateway-2:
    image: chatapp/apollo-gateway:latest
    environment:
      - PORT=4000
      - NODE_ENV=production
    networks:
      - api-network

  websocket-gateway-1:
    image: chatapp/websocket-gateway:latest
    environment:
      - PORT=4001
      - NODE_ENV=production
    networks:
      - api-network

  websocket-gateway-2:
    image: chatapp/websocket-gateway:latest
    environment:
      - PORT=4001
      - NODE_ENV=production
    networks:
      - api-network

networks:
  api-network:
    driver: bridge
```

## Monitoring and Metrics

### nginx Metrics Collection

```nginx
# Add to nginx.conf for metrics
location /metrics {
    access_log off;
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    deny all;
    
    content_by_lua_block {
        local prometheus = require "resty.prometheus"
        prometheus:collect()
    }
}
```

### Health Check Monitoring

```bash
#!/bin/bash
# health-check.sh

# Check Apollo Federation Gateway
apollo_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
if [ "$apollo_health" != "200" ]; then
    echo "Apollo Federation Gateway unhealthy: $apollo_health"
    # Send alert
fi

# Check WebSocket Gateway
ws_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ws/health)
if [ "$ws_health" != "200" ]; then
    echo "WebSocket Gateway unhealthy: $ws_health"
    # Send alert
fi

# Check overall load balancer health
lb_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health/check)
if [ "$lb_health" != "200" ]; then
    echo "Load balancer health check failed: $lb_health"
    # Send alert
fi
```

## Security Considerations

### Rate Limiting
- API requests: 10 requests/second per IP
- WebSocket connections: 5 connections/second per IP
- Burst allowance for legitimate traffic spikes

### SSL/TLS Configuration
- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS headers
- Certificate management and renewal

### DDoS Protection
- Connection limits per IP
- Request size limits
- Timeout configurations
- Geographic blocking if needed

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Check Upgrade header handling
   - Verify proxy_buffering is off
   - Ensure long timeout values

2. **Session Affinity Problems**
   - Use ip_hash for WebSocket upstream
   - Check cookie-based affinity if needed

3. **Health Check Failures**
   - Verify health endpoints are accessible
   - Check upstream server health
   - Review timeout configurations

### Debugging Commands

```bash
# Check nginx configuration
nginx -t

# Reload nginx configuration
nginx -s reload

# Monitor nginx access logs
tail -f /var/log/nginx/chatapp_access.log

# Check upstream server status
curl -H "Host: api.chatapp.com" http://localhost/health
curl -H "Host: api.chatapp.com" http://localhost/ws/health
```

This load balancer configuration ensures proper routing of HTTP and WebSocket traffic to the appropriate gateways while providing high availability, security, and monitoring capabilities.
