/**
 * Chat Service GraphQL Types
 *
 * This file exports all GraphQL types for the Chat Service.
 */

// User Types (Federation Extension)
export { UserType } from './user.types';

// Message Types
export {
  MessageType,
  MessageTypeEnum,
  MessageEditHistoryType,
  MessageAttachmentType,
  MessageReactionType,
  MessageConnection,
} from './message.types';

// Conversation Types
export {
  ConversationType,
  ConversationTypeEnum,
  ConversationSettingsType,
  ConversationParticipantType,
  ConversationConnection,
  ConversationSummaryType,
} from './conversation.types';

// Input Types
export {
  SendMessageInput,
  UpdateMessageInput,
  CreateConversationInput,
  UpdateConversationInput,
  AddParticipantsInput,
  RemoveParticipantsInput,
  AddReactionInput,
  ConversationSettingsInput,
  MarkMessagesReadInput,
  MarkMessageDeliveredInput,
  MarkMessageReadInput,
  StartTypingInput,
  StopTypingInput,
  UpdatePresenceInput,
  UserPresenceType,
} from './input.types';

// Response Types
export {
  DeleteMessageResponse,
  DeleteConversationResponse,
  AddReactionResponse,
  RemoveReactionResponse,
  MessageStatusUpdateResponse,
  TypingStatusResponse,
  TypingStatusType,
  MessageStatusUpdateType,
  UserPresenceResponse,
  UserPresenceInfoType,
} from './response.types';
