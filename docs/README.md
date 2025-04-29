# Chat Application Documentation

This directory contains all documentation for the Chat Application project, organized by functional area.

## Documentation Standards

To ensure consistency across all project documentation, please follow these standards:

- [Documentation Standard](DOCUMENTATION_STANDARD.md) - Guidelines for document formatting and structure
- [Document Template](TEMPLATE.md) - Template for creating new documentation
- [Plan Template](PLAN_TEMPLATE.md) - Template specifically for implementation plans

When creating or updating documentation:
1. Use the appropriate template as a starting point
2. Follow the formatting guidelines in the Documentation Standard
3. Include all required sections, especially the Document Information section
4. Update the Table of Contents when adding or removing sections
5. Ensure all links to other documents use relative paths

### Documentation Scripts

To help maintain documentation standards, the following scripts are available:

- **Create New Document**:
  ```bash
  ./docs/scripts/create_doc.sh standard|plan path/to/new/document.md "Document Title"
  ```

- **Standardize Existing Document**:
  ```bash
  ./docs/scripts/standardize_doc.sh path/to/existing/document.md
  ```

- **Check Standardization Progress**:
  ```bash
  ./docs/scripts/check_standardization.sh
  ```

## Directory Structure

### Project Overview
- [Project Overview](project/PROJECT_OVERVIEW.md) - High-level overview of the project
- [Project Plan](project/PROJECT_PLAN.md) - Overall project implementation plan

### Server
- [Server Plan](server/SERVER_PLAN.md) - Main server implementation plan
- [API Gateway Plan](server/API_GATEWAY_PLAN.md) - API Gateway microservice implementation
- [Auth Service Plan](server/AUTH_SERVICE_PLAN.md) - Authentication microservice implementation
- [User Service Plan](server/USER_SERVICE_PLAN.md) - User management microservice implementation
- [Chat Service Plan](server/CHAT_SERVICE_PLAN.md) - Chat functionality microservice implementation
- [Notification Service Plan](server/NOTIFICATION_SERVICE_PLAN.md) - Notification microservice implementation
- [CQRS Implementation Plan](server/CQRS_IMPLEMENTATION_PLAN.md) - Command Query Responsibility Segregation implementation
- [DDD Implementation Guide](server/DDD_IMPLEMENTATION_GUIDE.md) - Domain-Driven Design implementation guide

### Client
- [Client Plan](client/CLIENT_PLAN.md) - Overall client implementation plan
- [Web Client Plan](client/WEB_CLIENT_PLAN.md) - Web client implementation plan
- [Mobile Client Plan](client/MOBILE_CLIENT_PLAN.md) - Mobile client implementation plan

### Infrastructure
- [Infrastructure Plan](infrastructure/INFRASTRUCTURE_PLAN.md) - Overall infrastructure setup

### Database
- [Database Plan](database/DATABASE_PLAN.md) - Database implementation plan
- [Drizzle Setup](database/DRIZZLE_SETUP.md) - Drizzle ORM setup guide

### Docker
- [Docker Plan](docker/DOCKER_PLAN.md) - Docker configuration plan
- [Docker Performance Guide](docker/DOCKER_PERFORMANCE_GUIDE.md) - Docker optimization guide

### Deployment
- [AWS Deployment Plan](deployment/AWS_DEPLOYMENT_PLAN.md) - AWS deployment plan

### Testing
- [Testing Plan](testing/TESTING_PLAN.md) - Overall testing strategy
- [Testing Setup Report](testing/TESTING_SETUP_REPORT.md) - Testing setup verification report

### Logging
- [Logging Architecture](logging/LOGGING_ARCHITECTURE.md) - Logging system architecture
- [Logging Implementation Plan](logging/LOGGING_IMPLEMENTATION_PLAN.md) - Logging system implementation plan
- [Logging Technical Design](logging/LOGGING_TECHNICAL_DESIGN.md) - Logging system technical specifications
- [Logging Dashboard Design](logging/LOGGING_DASHBOARD_DESIGN.md) - Grafana dashboard designs for logging
