import { SendMessageHandler } from './send-message.handler';
import { CreateConversationHandler } from './create-conversation.handler';
import { UpdateMessageHandler } from './update-message.handler';
import { DeleteMessageHandler } from './delete-message.handler';
import { AddParticipantsHandler } from './add-participants.handler';
import { RemoveParticipantsHandler } from './remove-participants.handler';

export const CommandHandlers = [
  SendMessageHandler,
  CreateConversationHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
  AddParticipantsHandler,
  RemoveParticipantsHandler,
];

export {
  SendMessageHandler,
  CreateConversationHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
  AddParticipantsHandler,
  RemoveParticipantsHandler,
};
