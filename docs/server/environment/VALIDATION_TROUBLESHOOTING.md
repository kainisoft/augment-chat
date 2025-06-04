# Environment Variable Validation and Troubleshooting Guide

## Overview

This document provides comprehensive guidance for resolving environment variable validation errors and troubleshooting common configuration issues across all microservices.

## Validation System Overview

The environment variable validation system uses the `EnvironmentValidationService` to ensure all configuration values meet required standards before service startup.

### Validation Process

1. **Service Startup**: ConfigurationService loads environment variables
2. **Validation Execution**: EnvironmentValidationService validates all variables
3. **Error Handling**: Service fails to start if validation errors are detected
4. **Success Logging**: Successful validation is logged for confirmation

## Validation Types and Rules

### 1. String Validation

**Validation Rules**:
- Minimum length requirements
- Maximum length limits
- Pattern matching (regex)
- Allowed values enumeration

**Common Errors**:

```
Error: JWT_SECRET must be at least 32 characters long
```
**Resolution**: Update JWT_SECRET to meet minimum length requirement
```env
# ❌ Too short
JWT_SECRET=short-key

# ✅ Correct length
JWT_SECRET=change-me-in-production-this-is-32-chars-long
```

```
Error: NODE_ENV must be one of: development, production, test
```
**Resolution**: Use only allowed environment values
```env
# ❌ Invalid value
NODE_ENV=staging

# ✅ Valid value
NODE_ENV=development
```

### 2. Number Validation

**Validation Rules**:
- Minimum value constraints
- Maximum value constraints
- Integer validation

**Common Errors**:

```
Error: PORT must be between 1000 and 65535
```
**Resolution**: Use valid port range
```env
# ❌ Invalid port
PORT=80

# ✅ Valid port
PORT=4001
```

```
Error: QUERY_COMPLEXITY_LIMIT must be between 100 and 10000
```
**Resolution**: Adjust complexity limit to valid range
```env
# ❌ Too high
QUERY_COMPLEXITY_LIMIT=50000

# ✅ Valid range
QUERY_COMPLEXITY_LIMIT=1000
```

### 3. Boolean Validation

**Validation Rules**:
- Must be exactly `true` or `false`
- Case-insensitive validation

**Common Errors**:

```
Error: GRAPHQL_PLAYGROUND must be 'true' or 'false'
```
**Resolution**: Use proper boolean values
```env
# ❌ Invalid boolean
GRAPHQL_PLAYGROUND=yes

# ✅ Valid boolean
GRAPHQL_PLAYGROUND=true
```

### 4. URL Validation

**Validation Rules**:
- Valid URL format
- Protocol requirements
- Pattern matching for specific URL types

**Common Errors**:

```
Error: DATABASE_URL_USER must be a valid URL
```
**Resolution**: Ensure proper URL format
```env
# ❌ Invalid URL
DATABASE_URL_USER=postgres://localhost/db

# ✅ Valid URL
DATABASE_URL_USER=postgresql://user:pass@postgres:5432/userdb
```

```
Error: MONGODB_URI does not match required URL pattern
```
**Resolution**: Use correct MongoDB URI format
```env
# ❌ Wrong protocol
MONGODB_URI=mysql://mongo:27017/chatdb

# ✅ Correct protocol
MONGODB_URI=mongodb://mongo:27017/chatdb
```

### 5. Email Validation

**Validation Rules**:
- Valid email format
- Domain validation

**Common Errors**:

```
Error: SMTP_USER must be a valid email address
```
**Resolution**: Use proper email format
```env
# ❌ Invalid email
SMTP_USER=admin

# ✅ Valid email
SMTP_USER=admin@example.com
```

### 6. Pattern Validation

**Validation Rules**:
- Regular expression matching
- Format-specific patterns

**Common Errors**:

```
Error: REDIS_KEY_PREFIX does not match required pattern
```
**Resolution**: Ensure key prefix ends with underscore
```env
# ❌ Missing underscore
REDIS_KEY_PREFIX=user

# ✅ Correct pattern
REDIS_KEY_PREFIX=user_
```

```
Error: SMS_FROM_NUMBER must be in E.164 format
```
**Resolution**: Use international phone number format
```env
# ❌ Invalid format
SMS_FROM_NUMBER=1234567890

# ✅ E.164 format
SMS_FROM_NUMBER=+1234567890
```

## Service-Specific Validation Errors

### Auth Service

**Common Issues**:

1. **Session Encryption Key Too Short**
```
Error: SESSION_ENCRYPTION_KEY must be at least 32 characters long
```
**Resolution**:
```env
SESSION_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

2. **Invalid Bcrypt Rounds**
```
Error: BCRYPT_ROUNDS must be between 10 and 15
```
**Resolution**:
```env
BCRYPT_ROUNDS=12
```

3. **Invalid Account Lockout Settings**
```
Error: ACCOUNT_LOCKOUT_ATTEMPTS must be between 3 and 10
```
**Resolution**:
```env
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=15
```

### User Service

**Common Issues**:

1. **GraphQL Complexity Limits**
```
Error: QUERY_COMPLEXITY_LIMIT must be between 100 and 10000
```
**Resolution**:
```env
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=10
```

2. **Cache TTL Out of Range**
```
Error: CACHE_TTL must be between 60 and 3600
```
**Resolution**:
```env
CACHE_TTL=300
```

### Chat Service

**Common Issues**:

1. **Message Length Limits**
```
Error: MAX_MESSAGE_LENGTH must be between 1000 and 50000
```
**Resolution**:
```env
MAX_MESSAGE_LENGTH=10000
```

2. **WebSocket Configuration**
```
Error: WEBSOCKET_PORT must be between 1000 and 65535
```
**Resolution**:
```env
WEBSOCKET_PORT=4003
WEBSOCKET_PATH=/socket.io
```

### Notification Service

**Common Issues**:

1. **SMTP Configuration**
```
Error: SMTP_PORT must be between 1 and 65535
```
**Resolution**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
```

2. **Rate Limiting Configuration**
```
Error: RATE_LIMIT_PER_USER must be between 1 and 1000
```
**Resolution**:
```env
RATE_LIMIT_PER_USER=100
RATE_LIMIT_WINDOW=3600
```

### API Gateway

**Common Issues**:

1. **Service URL Configuration**
```
Error: USER_SERVICE_URL does not match required GraphQL URL pattern
```
**Resolution**:
```env
USER_SERVICE_URL=http://user-service:4002/api/graphql
```

2. **Federation Timeout Settings**
```
Error: FEDERATION_TIMEOUT must be between 1000 and 60000
```
**Resolution**:
```env
FEDERATION_TIMEOUT=10000
FEDERATION_POLLING_INTERVAL=30000
```

### Logging Service

**Common Issues**:

1. **Loki Batch Configuration**
```
Error: LOKI_BATCH_SIZE must be between 1 and 1000
```
**Resolution**:
```env
LOKI_BATCH_SIZE=100
LOKI_BATCH_WAIT=5000
```

2. **Log Retention Settings**
```
Error: LOG_RETENTION_DAYS must be between 1 and 365
```
**Resolution**:
```env
LOG_RETENTION_DAYS=90
```

## Troubleshooting Workflow

### Step 1: Identify the Error

1. **Check service startup logs** for validation error messages
2. **Locate the failing variable** in the error message
3. **Identify the validation rule** that failed

### Step 2: Understand the Requirement

1. **Check service-specific documentation** for variable requirements
2. **Review validation rules** for the specific variable type
3. **Understand the business logic** behind the validation

### Step 3: Fix the Configuration

1. **Update the environment file** with correct values
2. **Verify the fix** meets all validation requirements
3. **Test the configuration** by restarting the service

### Step 4: Verify the Solution

1. **Check service startup logs** for successful validation
2. **Verify service health** using health check endpoints
3. **Test service functionality** to ensure proper operation

## Common Resolution Patterns

### 1. String Length Issues

**Pattern**: Variable too short or too long
**Solution**: Adjust string length to meet requirements
```env
# Check minimum/maximum length requirements
# Generate appropriate length strings for secrets
```

### 2. Numeric Range Issues

**Pattern**: Number outside allowed range
**Solution**: Use values within specified ranges
```env
# Check min/max values in documentation
# Use appropriate values for your environment
```

### 3. Format Issues

**Pattern**: Invalid format for URLs, emails, phone numbers
**Solution**: Use correct format patterns
```env
# URLs: Include protocol and proper structure
# Emails: Use valid email format
# Phone numbers: Use E.164 international format
```

### 4. Boolean Issues

**Pattern**: Invalid boolean values
**Solution**: Use only `true` or `false`
```env
# Use lowercase true/false
# Avoid yes/no, 1/0, or other boolean representations
```

## Validation Testing

### Manual Testing

Use the validation script to test environment files:
```bash
node scripts/validate-env.js
```

### Automated Testing

Include validation tests in CI/CD pipeline:
```bash
# In CI/CD pipeline
npm run validate:env
```

### Service-Specific Testing

Test individual service configurations:
```bash
# Test specific service
docker compose up auth-service --build
```

## Best Practices

### 1. Development Environment

- Use placeholder values that meet validation requirements
- Enable debug logging for troubleshooting
- Use relaxed security settings for development

### 2. Production Environment

- Use environment variable substitution for secrets
- Implement strict security settings
- Use appropriate performance configurations

### 3. Configuration Management

- Document all custom configurations
- Use consistent naming patterns
- Implement configuration validation in CI/CD

### 4. Error Handling

- Monitor validation errors in production
- Implement alerting for configuration issues
- Maintain configuration documentation

## Related Documentation

- [Environment Variables Overview](../ENVIRONMENT_VARIABLES.md)
- [Service-Specific Environment Documentation](./README.md)
- [Configuration Service Documentation](../../libs/configuration/README.md)

---

**Last Updated**: January 2024  
**Version**: 1.0.0
