/**
 * Chat Service GraphQL Resolvers
 *
 * This file exports all GraphQL resolvers for the Chat Service.
 */

import { HelloResolver } from './hello.resolver';
import { MessageResolver } from './message.resolver';
import { ConversationResolver } from './conversation.resolver';
import { SubscriptionResolver } from './subscription.resolver';
import { PresenceResolver } from './presence.resolver';

/**
 * Array of all resolver classes to be registered with the GraphQL module
 */
export const resolvers = [
  HelloResolver,
  MessageResolver,
  ConversationResolver,
  SubscriptionResolver,
  PresenceResolver,
];

/**
 * Export individual resolvers for direct imports
 */
export {
  HelloResolver,
  MessageResolver,
  ConversationResolver,
  SubscriptionResolver,
  PresenceResolver,
};
