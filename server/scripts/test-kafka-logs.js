/**
 * Script to test sending log messages to the Kafka logs topic
 * 
 * Usage:
 * node scripts/test-kafka-logs.js
 */

const { Kafka } = require('kafkajs');

// Configuration
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
const KAFKA_TOPIC = process.env.KAFKA_LOGS_TOPIC || 'logs';
const CLIENT_ID = 'test-log-producer';

// Create Kafka client
const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: KAFKA_BROKERS.split(','),
});

// Create producer
const producer = kafka.producer();

// Sample log messages
const logMessages = [
  {
    key: 'api-gateway',
    value: JSON.stringify({
      level: 'info',
      message: 'Request processed successfully',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      context: 'RequestHandler',
      metadata: {
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        responseTime: 45,
      },
    }),
  },
  {
    key: 'auth-service',
    value: JSON.stringify({
      level: 'warn',
      message: 'Failed login attempt',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      requestId: '123e4567-e89b-12d3-a456-426614174001',
      context: 'AuthController',
      metadata: {
        username: 'user@example.com',
        reason: 'Invalid credentials',
        attempts: 3,
      },
    }),
  },
  {
    key: 'user-service',
    value: JSON.stringify({
      level: 'error',
      message: 'Database connection failed',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      requestId: '123e4567-e89b-12d3-a456-426614174002',
      context: 'UserRepository',
      stack: 'Error: Connection refused at Database.connect (/app/src/database.ts:45:7)',
      code: 'ECONNREFUSED',
      metadata: {
        host: 'postgres',
        port: 5432,
        database: 'users',
      },
    }),
  },
  {
    key: 'chat-service',
    value: JSON.stringify({
      level: 'debug',
      message: 'Message delivered to recipient',
      service: 'chat-service',
      timestamp: new Date().toISOString(),
      requestId: '123e4567-e89b-12d3-a456-426614174003',
      userId: 'user-123',
      context: 'MessageService',
      metadata: {
        messageId: 'msg-456',
        conversationId: 'conv-789',
        recipientId: 'user-456',
      },
    }),
  },
  // Invalid message to test error handling
  {
    key: 'notification-service',
    value: JSON.stringify({
      message: 'Missing required fields',
      service: 'notification-service',
      // Missing level field
    }),
  },
];

// Send messages to Kafka
async function sendMessages() {
  try {
    // Connect to Kafka
    console.log('Connecting to Kafka...');
    await producer.connect();
    console.log('Connected to Kafka');

    // Send each message
    console.log(`Sending ${logMessages.length} messages to topic: ${KAFKA_TOPIC}`);
    
    for (const msg of logMessages) {
      await producer.send({
        topic: KAFKA_TOPIC,
        messages: [msg],
      });
      console.log(`Sent message from ${msg.key}`);
    }

    console.log('All messages sent successfully');
  } catch (error) {
    console.error('Error sending messages:', error);
  } finally {
    // Disconnect
    await producer.disconnect();
    console.log('Disconnected from Kafka');
  }
}

// Run the function
sendMessages().catch(console.error);
