/**
 * Chat Service GraphQL Resolvers
 *
 * This file exports all GraphQL resolvers for the Chat Service.
 */

import { MessageResolver } from './message.resolver';
import { ConversationResolver } from './conversation.resolver';
import { SubscriptionResolver } from './subscription.resolver';
import { PresenceResolver } from './presence.resolver';
import {
  MessageEntityResolver,
  ConversationEntityResolver,
  UserEntityResolver,
} from './entity.resolver';

/**
 * Array of all resolver classes to be registered with the GraphQL module
 */
export const resolvers = [
  MessageResolver,
  ConversationResolver,
  SubscriptionResolver,
  PresenceResolver,
  MessageEntityResolver,
  ConversationEntityResolver,
  UserEntityResolver,
];

/**
 * Export individual resolvers for direct imports
 */
export {
  MessageResolver,
  ConversationResolver,
  SubscriptionResolver,
  PresenceResolver,
  MessageEntityResolver,
  ConversationEntityResolver,
  UserEntityResolver,
};
