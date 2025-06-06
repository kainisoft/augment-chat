/**
 * Chat Service GraphQL Resolvers
 *
 * This file exports all GraphQL resolvers for the Chat Service.
 * Following the 'gold standard' pattern from user-service.
 */

import { HelloResolver } from './hello.resolver';
import { MessageResolver } from './message.resolver';
import { ConversationResolver } from './conversation.resolver';

/**
 * Array of all resolver classes to be registered with the GraphQL module
 */
export const resolvers = [HelloResolver, MessageResolver, ConversationResolver];

/**
 * Export individual resolvers for direct imports
 */
export { HelloResolver, MessageResolver, ConversationResolver };
