import { MessageDeliveredHandler } from './message-delivered.handler';
import { MessageReadHandler } from './message-read.handler';

// Event handlers for message delivery status
export const EventHandlers = [MessageDeliveredHandler, MessageReadHandler];

// Export event handlers
export { MessageDeliveredHandler, MessageReadHandler };

// TODO: Implement additional event handlers for Kafka integration
// export * from './message-sent.handler';
// export * from './conversation-created.handler';
