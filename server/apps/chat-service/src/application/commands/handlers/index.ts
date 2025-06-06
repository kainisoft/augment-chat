import { SendMessageHandler } from './send-message.handler';
import { CreateConversationHandler } from './create-conversation.handler';
import { UpdateMessageHandler } from './update-message.handler';
import { DeleteMessageHandler } from './delete-message.handler';

export const CommandHandlers = [
  SendMessageHandler,
  CreateConversationHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
];

export {
  SendMessageHandler,
  CreateConversationHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
};
