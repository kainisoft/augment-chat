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
    "\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.SingInDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.SignUpDocument,
};
const documents: Documents = {
    "\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.SingInDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.SignUpDocument,
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
export function gql(source: "\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SingIn($input: SignInInput!) {\n    signIn(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;