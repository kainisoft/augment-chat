import type { CodegenConfig } from '@graphql-codegen/cli';
import { join } from 'path';

// Get the absolute path to the user-service directory
const userServicePath = __dirname;

// Define paths relative to the user-service directory
const schemaPath = join(userServicePath, 'src/graphql/generated/schema.gql');
const outputPath = join(userServicePath, 'src/graphql/generated');

const config: CodegenConfig = {
  schema: schemaPath,
  documents: undefined,
  generates: {
    [join(outputPath, 'graphql.ts')]: {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../types#GraphQLContext',
        mappers: {
          User: '../types#UserModel',
          Relationship: '../types#RelationshipModel',
          UserSetting: '../types#UserSettingModel',
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
    [join(outputPath, 'operations.ts')]: {
      plugins: ['typescript-operations'],
      config: {
        avoidOptionals: true,
        maybeValue: 'T | null',
        scalars: {
          DateTime: 'Date',
          JSON: 'Record<string, any>',
        },
      },
    },
  },
};

export default config;
