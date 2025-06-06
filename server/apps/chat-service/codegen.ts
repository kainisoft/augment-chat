import type { CodegenConfig } from '@graphql-codegen/cli';
import { join } from 'path';

// Get the absolute path to the chat-service directory
const chatServicePath = __dirname;

// Define paths relative to the chat-service directory
const schemaPath = join(chatServicePath, 'src/graphql/generated/schema.gql');
const outputPath = join(chatServicePath, 'src/graphql/generated');

const config: CodegenConfig = {
  schema: schemaPath,
  documents: undefined,
  generates: {
    [join(outputPath, 'graphql.ts')]: {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../types/graphql-context#GraphQLContext',
        mappers: {
          MessageType: '../../database/models/message.model#MessageModel',
          ConversationType:
            '../../database/models/conversation.model#ConversationModel',
          MessageAttachmentType:
            '../../database/models/attachment.model#AttachmentModel',
          MessageReactionType:
            '../../database/models/reaction.model#ReactionModel',
        },
        scalars: {
          DateTime: 'Date',
          JSON: 'Record<string, any>',
        },
        enumsAsTypes: true,
        avoidOptionals: true,
        maybeValue: 'T | null',
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
