import { SendMessageHandler } from './send-message.handler';
import { CreateConversationHandler } from './create-conversation.handler';
import { UpdateMessageHandler } from './update-message.handler';
import { DeleteMessageHandler } from './delete-message.handler';
import { AddParticipantsHandler } from './add-participants.handler';
import { RemoveParticipantsHandler } from './remove-participants.handler';
import { MarkMessageDeliveredHandler } from './mark-message-delivered.handler';
import { MarkMessageReadHandler } from './mark-message-read.handler';
import { StartTypingHandler } from './start-typing.handler';
import { StopTypingHandler } from './stop-typing.handler';

export const CommandHandlers = [
  SendMessageHandler,
  CreateConversationHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
  AddParticipantsHandler,
  RemoveParticipantsHandler,
  MarkMessageDeliveredHandler,
  MarkMessageReadHandler,
  StartTypingHandler,
  StopTypingHandler,
];

export {
  SendMessageHandler,
  CreateConversationHandler,
  UpdateMessageHandler,
  DeleteMessageHandler,
  AddParticipantsHandler,
  RemoveParticipantsHandler,
  MarkMessageDeliveredHandler,
  MarkMessageReadHandler,
  StartTypingHandler,
  StopTypingHandler,
};
