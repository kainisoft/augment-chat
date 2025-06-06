import { GetMessageHandler } from './get-message.handler';
import { GetConversationMessagesHandler } from './get-conversation-messages.handler';
import { GetConversationHandler } from './get-conversation.handler';
import { GetUserConversationsHandler } from './get-user-conversations.handler';

export const QueryHandlers = [
  GetMessageHandler,
  GetConversationMessagesHandler,
  GetConversationHandler,
  GetUserConversationsHandler,
];

export {
  GetMessageHandler,
  GetConversationMessagesHandler,
  GetConversationHandler,
  GetUserConversationsHandler,
};
