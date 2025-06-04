#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates environment files against the defined validation rules
 * to ensure all environment configurations are correct.
 */

const fs = require('fs');
const path = require('path');

// Simple environment file parser
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

// Simple validation functions
function validateRule(rule, value) {
  if (rule.required && (!value || value.trim() === '')) {
    return { error: `Required environment variable ${rule.key} is missing` };
  }

  if (!value) {
    return {};
  }

  switch (rule.type) {
    case 'number':
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        return { error: `${rule.key} must be a valid number` };
      }
      if (rule.min && num < rule.min) {
        return { error: `${rule.key} must be at least ${rule.min}` };
      }
      if (rule.max && num > rule.max) {
        return { error: `${rule.key} must be at most ${rule.max}` };
      }
      break;
      
    case 'boolean':
      const lowerValue = value.toLowerCase();
      if (!['true', 'false'].includes(lowerValue)) {
        return { error: `${rule.key} must be 'true' or 'false'` };
      }
      break;
      
    case 'url':
      try {
        new URL(value);
      } catch {
        return { error: `${rule.key} must be a valid URL` };
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return { error: `${rule.key} does not match required URL pattern` };
      }
      break;
      
    case 'string':
      if (rule.min && value.length < rule.min) {
        return { error: `${rule.key} must be at least ${rule.min} characters long` };
      }
      if (rule.max && value.length > rule.max) {
        return { error: `${rule.key} must be at most ${rule.max} characters long` };
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return { error: `${rule.key} does not match required pattern` };
      }
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        return { error: `${rule.key} must be one of: ${rule.allowedValues.join(', ')}` };
      }
      break;
  }
  
  return {};
}

// Basic validation rules for testing
const commonRules = [
  {
    key: 'NODE_ENV',
    required: true,
    type: 'string',
    allowedValues: ['development', 'production', 'test'],
    description: 'Application environment',
  },
  {
    key: 'PORT',
    required: false,
    type: 'number',
    min: 1000,
    max: 65535,
    description: 'Service port number',
  },
  {
    key: 'JWT_SECRET',
    required: true,
    type: 'string',
    min: 32,
    description: 'JWT signing secret (minimum 32 characters)',
  },
];

// Service-specific rules
const serviceRules = {
  'user-service': [
    ...commonRules,
    {
      key: 'DATABASE_URL_USER',
      required: true,
      type: 'url',
      pattern: /^postgresql:\/\/.+/,
      description: 'User service PostgreSQL database connection URL',
    },
  ],
  'chat-service': [
    ...commonRules,
    {
      key: 'MONGODB_URI',
      required: true,
      type: 'url',
      pattern: /^mongodb:\/\/.+/,
      description: 'Chat service MongoDB connection URI',
    },
  ],
  'notification-service': [
    ...commonRules,
    {
      key: 'MONGODB_URI',
      required: true,
      type: 'url',
      pattern: /^mongodb:\/\/.+/,
      description: 'Notification service MongoDB connection URI',
    },
  ],
};

// Validate environment files
function validateEnvironmentFiles() {
  const configDir = path.join(__dirname, '..', 'docker', 'config');
  const services = ['user-service', 'chat-service', 'notification-service', 'auth-service', 'api-gateway', 'logging-service'];
  
  let allValid = true;
  
  services.forEach(service => {
    const envFile = path.join(configDir, service, `${service}.env`);
    console.log(`\nValidating ${service}...`);
    
    if (!fs.existsSync(envFile)) {
      console.log(`❌ Environment file not found: ${envFile}`);
      allValid = false;
      return;
    }
    
    const env = parseEnvFile(envFile);
    const rules = serviceRules[service] || commonRules;
    const errors = [];
    
    rules.forEach(rule => {
      const result = validateRule(rule, env[rule.key]);
      if (result.error) {
        errors.push(result.error);
      }
    });
    
    if (errors.length === 0) {
      console.log(`✅ ${service} validation passed`);
    } else {
      console.log(`❌ ${service} validation failed:`);
      errors.forEach(error => console.log(`   - ${error}`));
      allValid = false;
    }
  });
  
  return allValid;
}

// Run validation
console.log('🔍 Validating environment files...');
const isValid = validateEnvironmentFiles();

if (isValid) {
  console.log('\n✅ All environment files are valid!');
  process.exit(0);
} else {
  console.log('\n❌ Some environment files have validation errors.');
  process.exit(1);
}
