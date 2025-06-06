/**
 * Chat Service GraphQL Types
 *
 * This file exports all GraphQL types for the Chat Service.
 * Following the 'gold standard' pattern from user-service.
 */

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
} from './input.types';

// Response Types
export {
  DeleteMessageResponse,
  DeleteConversationResponse,
  AddReactionResponse,
  RemoveReactionResponse,
} from './response.types';
