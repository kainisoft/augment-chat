# Logging Dashboard Design

## Overview

This document outlines the design for Grafana dashboards that will be used to visualize and monitor logs from our Chat Application. It provides detailed specifications for each dashboard, including their purpose, layout, panels, metrics, and visualizations. These dashboards will enable real-time monitoring, troubleshooting, and analysis of system behavior and performance.

## Table of Contents

- [Overview](#overview)
- [1. System Overview Dashboard](#1-system-overview-dashboard)
- [2. Service-Specific Dashboards](#2-service-specific-dashboards)
  - [2.1 API Gateway Dashboard](#21-api-gateway-dashboard)
  - [2.2 Auth Service Dashboard](#22-auth-service-dashboard)
  - [2.3 User Service Dashboard](#23-user-service-dashboard)
  - [2.4 Chat Service Dashboard](#24-chat-service-dashboard)
  - [2.5 Notification Service Dashboard](#25-notification-service-dashboard)
- [3. Log Explorer Dashboard](#3-log-explorer-dashboard)
- [4. Error Tracking Dashboard](#4-error-tracking-dashboard)
- [5. Performance Dashboard](#5-performance-dashboard)
- [Dashboard Provisioning](#dashboard-provisioning)
- [Related Documents](#related-documents)

## 1. System Overview Dashboard

### Purpose
Provide a high-level view of the entire system's health and performance.

### Layout

#### Row 1: System Health
- **Panel 1**: System Status
  - Type: Stat panel
  - Metrics: Service availability percentage
  - Thresholds: >99% (green), >95% (yellow), <95% (red)

- **Panel 2**: Active Services
  - Type: Gauge
  - Metrics: Number of active services / total services
  - Thresholds: 100% (green), >80% (yellow), <80% (red)

- **Panel 3**: Total Request Rate
  - Type: Time series
  - Metrics: Requests per second across all services
  - Visualization: Line graph with 5-minute average

- **Panel 4**: Error Rate
  - Type: Time series
  - Metrics: Percentage of requests resulting in errors
  - Thresholds: <1% (green), <5% (yellow), >5% (red)

#### Row 2: Service Performance
- **Panel 1**: Response Time by Service
  - Type: Time series
  - Metrics: 95th percentile response time for each service
  - Visualization: Line graph with service colors

- **Panel 2**: Request Volume by Service
  - Type: Bar gauge
  - Metrics: Requests per minute for each service
  - Visualization: Horizontal bars

- **Panel 3**: Error Count by Service
  - Type: Bar chart
  - Metrics: Error count for each service
  - Visualization: Vertical bars with service colors

- **Panel 4**: Service Health Map
  - Type: Status map
  - Metrics: Combined health score for each service
  - Visualization: Heatmap with service names

#### Row 3: Recent Activity
- **Panel 1**: Recent Errors
  - Type: Table
  - Data: Most recent error logs
  - Columns: Timestamp, Service, Message, User ID

- **Panel 2**: Log Volume
  - Type: Time series
  - Metrics: Logs per minute by level
  - Visualization: Stacked area chart (debug, info, warn, error)

- **Panel 3**: Active Users
  - Type: Time series
  - Metrics: Unique users making requests
  - Visualization: Line graph with 5-minute average

## 2. Service-Specific Dashboards

### 2.1 API Gateway Dashboard

#### Row 1: Gateway Overview
- **Panel 1**: Gateway Status
  - Type: Stat panel
  - Metrics: Gateway availability percentage

- **Panel 2**: Total Requests
  - Type: Time series
  - Metrics: Requests per second
  - Visualization: Line graph

- **Panel 3**: Average Response Time
  - Type: Gauge
  - Metrics: Average response time in ms
  - Thresholds: <100ms (green), <500ms (yellow), >500ms (red)

- **Panel 4**: Error Rate
  - Type: Time series
  - Metrics: Percentage of requests resulting in errors

#### Row 2: Request Details
- **Panel 1**: Requests by Endpoint
  - Type: Bar chart
  - Metrics: Request count by endpoint
  - Visualization: Horizontal bars

- **Panel 2**: Response Time by Endpoint
  - Type: Table
  - Metrics: Average, 95th percentile, and max response time by endpoint

- **Panel 3**: Status Codes
  - Type: Pie chart
  - Metrics: Distribution of HTTP status codes
  - Visualization: Color-coded by status code category

#### Row 3: Recent Activity
- **Panel 1**: Recent Requests
  - Type: Table
  - Data: Most recent request logs
  - Columns: Timestamp, Method, Path, Status, Duration

- **Panel 2**: Slow Requests
  - Type: Table
  - Data: Requests with longest duration
  - Columns: Timestamp, Method, Path, Duration, User ID

### 2.2 Auth Service Dashboard

#### Row 1: Auth Overview
- **Panel 1**: Auth Service Status
  - Type: Stat panel
  - Metrics: Service availability percentage

- **Panel 2**: Login Attempts
  - Type: Time series
  - Metrics: Login attempts per minute
  - Visualization: Line graph

- **Panel 3**: Login Success Rate
  - Type: Gauge
  - Metrics: Percentage of successful logins
  - Thresholds: >95% (green), >85% (yellow), <85% (red)

- **Panel 4**: Token Issuance
  - Type: Time series
  - Metrics: Tokens issued per minute
  - Visualization: Line graph

#### Row 2: Security Metrics
- **Panel 1**: Failed Logins
  - Type: Time series
  - Metrics: Failed login attempts per minute
  - Visualization: Line graph with threshold alert

- **Panel 2**: Failed Logins by IP
  - Type: Table
  - Metrics: Count of failed logins by IP address
  - Columns: IP Address, Count, Last Attempt

- **Panel 3**: Password Resets
  - Type: Time series
  - Metrics: Password reset requests per hour
  - Visualization: Bar chart

- **Panel 4**: Token Revocations
  - Type: Time series
  - Metrics: Token revocations per hour
  - Visualization: Line graph

#### Row 3: Recent Activity
- **Panel 1**: Recent Login Attempts
  - Type: Table
  - Data: Most recent login attempt logs
  - Columns: Timestamp, Username, Success, IP Address

- **Panel 2**: Recent Security Events
  - Type: Table
  - Data: Security-related logs
  - Columns: Timestamp, Event Type, User ID, Details

### 2.3 User Service Dashboard

Similar layout with user-specific metrics...

### 2.4 Chat Service Dashboard

Similar layout with chat-specific metrics...

### 2.5 Notification Service Dashboard

Similar layout with notification-specific metrics...

## 3. Log Explorer Dashboard

### Purpose
Provide a flexible interface for searching and analyzing logs across all services.

### Layout

#### Row 1: Search Controls
- **Panel 1**: Search Bar
  - Type: Text input
  - Function: Full-text search across logs

- **Panel 2**: Time Range Selector
  - Type: Time range input
  - Function: Select time range for log search

- **Panel 3**: Service Filter
  - Type: Multi-select dropdown
  - Options: All services in the system

- **Panel 4**: Level Filter
  - Type: Multi-select dropdown
  - Options: debug, info, warn, error

#### Row 2: Log Visualization
- **Panel 1**: Log Volume by Service
  - Type: Time series
  - Metrics: Logs per minute by service
  - Visualization: Stacked area chart

- **Panel 2**: Log Volume by Level
  - Type: Time series
  - Metrics: Logs per minute by level
  - Visualization: Stacked area chart

- **Panel 3**: Common Log Patterns
  - Type: Bar chart
  - Metrics: Frequency of common log message patterns
  - Visualization: Horizontal bars

#### Row 3: Log Results
- **Panel 1**: Log Table
  - Type: Table with log details
  - Data: Filtered logs based on search criteria
  - Columns: Timestamp, Service, Level, Message, Context
  - Features: Expandable rows for full log details

## 4. Error Tracking Dashboard

### Purpose
Focus specifically on error monitoring and troubleshooting.

### Layout

#### Row 1: Error Overview
- **Panel 1**: Total Errors
  - Type: Stat panel
  - Metrics: Total errors in selected time period
  - Visualization: Number with trend indicator

- **Panel 2**: Error Rate
  - Type: Time series
  - Metrics: Errors per minute
  - Visualization: Line graph with threshold alert

- **Panel 3**: Errors by Service
  - Type: Pie chart
  - Metrics: Distribution of errors by service
  - Visualization: Color-coded by service

- **Panel 4**: Errors by Type
  - Type: Bar chart
  - Metrics: Count of errors by error type/code
  - Visualization: Horizontal bars

#### Row 2: Error Analysis
- **Panel 1**: Top Error Messages
  - Type: Table
  - Metrics: Most frequent error messages
  - Columns: Message, Count, First Seen, Last Seen

- **Panel 2**: Error Frequency
  - Type: Heatmap
  - Metrics: Error frequency by hour and day
  - Visualization: Color-coded heatmap

- **Panel 3**: Related User Impact
  - Type: Gauge
  - Metrics: Percentage of users affected by errors
  - Thresholds: <1% (green), <5% (yellow), >5% (red)

#### Row 3: Error Details
- **Panel 1**: Recent Errors
  - Type: Table
  - Data: Most recent error logs with details
  - Columns: Timestamp, Service, Message, Stack Trace
  - Features: Expandable rows for full error details

## 5. Performance Dashboard

### Purpose
Monitor and analyze system performance metrics.

### Layout

#### Row 1: Response Time Overview
- **Panel 1**: Average Response Time
  - Type: Stat panel
  - Metrics: Average response time across all services
  - Visualization: Number with trend indicator

- **Panel 2**: Response Time Percentiles
  - Type: Time series
  - Metrics: 50th, 95th, and 99th percentile response times
  - Visualization: Line graph with different colors

- **Panel 3**: Slowest Endpoints
  - Type: Table
  - Metrics: Endpoints with highest average response time
  - Columns: Endpoint, Avg Time, Request Count

- **Panel 4**: Response Time Distribution
  - Type: Histogram
  - Metrics: Distribution of response times
  - Visualization: Histogram with buckets

#### Row 2: Resource Utilization
- **Panel 1**: CPU Usage by Service
  - Type: Time series
  - Metrics: CPU usage percentage by service
  - Visualization: Line graph

- **Panel 2**: Memory Usage by Service
  - Type: Time series
  - Metrics: Memory usage by service
  - Visualization: Line graph

- **Panel 3**: Database Query Time
  - Type: Time series
  - Metrics: Average database query execution time
  - Visualization: Line graph

- **Panel 4**: Kafka Lag
  - Type: Time series
  - Metrics: Consumer lag for Kafka topics
  - Visualization: Line graph

#### Row 3: Slow Operations
- **Panel 1**: Slow Requests
  - Type: Table
  - Data: Requests with longest duration
  - Columns: Timestamp, Service, Endpoint, Duration, User ID

- **Panel 2**: Slow Database Queries
  - Type: Table
  - Data: Database queries with longest execution time
  - Columns: Timestamp, Service, Query, Duration

## Dashboard Provisioning

All dashboards will be provisioned automatically using Grafana's provisioning feature. Dashboard JSON definitions will be stored in the repository under:

```
docker/grafana/provisioning/dashboards/
```

This ensures that dashboards are version-controlled and automatically available when the system is deployed.

## Related Documents

- [Logging Architecture](LOGGING_ARCHITECTURE.md)
- [Logging Implementation Plan](LOGGING_IMPLEMENTATION_PLAN.md)
- [Logging Technical Design](LOGGING_TECHNICAL_DESIGN.md)
- [Project Overview](../project/PROJECT_OVERVIEW.md)
- [Infrastructure Plan](../infrastructure/INFRASTRUCTURE_PLAN.md)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-07-15
- **Last Updated**: 2023-07-15
- **Version**: 1.0.0
