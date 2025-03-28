/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetChats {\n    getChats {\n      id\n      name\n      isGroup\n      lastMessageAt\n      messages(last: 1) {\n        id\n        content\n        createdAt\n        user {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n": typeof types.GetChatsDocument,
    "\n  query GetChatMessages($input: GetMessagesInput!) {\n    getMessages(input: $input) {\n      id\n      content\n      type\n      metadata\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n        status\n      }\n    }\n  }\n": typeof types.GetChatMessagesDocument,
    "\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.SendMessageDocument,
    "\n  subscription OnNewMessage($chatId: String!) {\n    messageCreated(chatId: $chatId) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.OnNewMessageDocument,
    "\n  mutation CreateChat($input: CreateChatInput!) {\n    createChat(input: $input) {\n      id\n      name\n      isGroup\n      members {\n        userId\n      }\n    }\n  }\n": typeof types.CreateChatDocument,
    "\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.SingInDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.SignUpDocument,
    "\n  mutation RefreshTokens($input: RefreshTokenInput!) {\n    refreshTokens(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.RefreshTokensDocument,
};
const documents: Documents = {
    "\n  query GetChats {\n    getChats {\n      id\n      name\n      isGroup\n      lastMessageAt\n      messages(last: 1) {\n        id\n        content\n        createdAt\n        user {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n": types.GetChatsDocument,
    "\n  query GetChatMessages($input: GetMessagesInput!) {\n    getMessages(input: $input) {\n      id\n      content\n      type\n      metadata\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n        status\n      }\n    }\n  }\n": types.GetChatMessagesDocument,
    "\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.SendMessageDocument,
    "\n  subscription OnNewMessage($chatId: String!) {\n    messageCreated(chatId: $chatId) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.OnNewMessageDocument,
    "\n  mutation CreateChat($input: CreateChatInput!) {\n    createChat(input: $input) {\n      id\n      name\n      isGroup\n      members {\n        userId\n      }\n    }\n  }\n": types.CreateChatDocument,
    "\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.SingInDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.SignUpDocument,
    "\n  mutation RefreshTokens($input: RefreshTokenInput!) {\n    refreshTokens(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.RefreshTokensDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetChats {\n    getChats {\n      id\n      name\n      isGroup\n      lastMessageAt\n      messages(last: 1) {\n        id\n        content\n        createdAt\n        user {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetChats {\n    getChats {\n      id\n      name\n      isGroup\n      lastMessageAt\n      messages(last: 1) {\n        id\n        content\n        createdAt\n        user {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetChatMessages($input: GetMessagesInput!) {\n    getMessages(input: $input) {\n      id\n      content\n      type\n      metadata\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n        status\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetChatMessages($input: GetMessagesInput!) {\n    getMessages(input: $input) {\n      id\n      content\n      type\n      metadata\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n        status\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription OnNewMessage($chatId: String!) {\n    messageCreated(chatId: $chatId) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription OnNewMessage($chatId: String!) {\n    messageCreated(chatId: $chatId) {\n      id\n      content\n      createdAt\n      user {\n        id\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateChat($input: CreateChatInput!) {\n    createChat(input: $input) {\n      id\n      name\n      isGroup\n      members {\n        userId\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateChat($input: CreateChatInput!) {\n    createChat(input: $input) {\n      id\n      name\n      isGroup\n      members {\n        userId\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RefreshTokens($input: RefreshTokenInput!) {\n    refreshTokens(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RefreshTokens($input: RefreshTokenInput!) {\n    refreshTokens(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;