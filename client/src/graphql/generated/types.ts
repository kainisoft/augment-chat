import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: { [key: string]: any }; output: { [key: string]: any }; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type Chat = {
  __typename?: 'Chat';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  id: Scalars['ID']['output'];
  isGroup: Scalars['Boolean']['output'];
  lastMessageAt: Scalars['DateTime']['output'];
  members: Array<ChatMember>;
  messages: Array<Message>;
  name?: Maybe<Scalars['String']['output']>;
};


export type ChatMessagesArgs = {
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ChatMember = {
  __typename?: 'ChatMember';
  chatId: Scalars['ID']['output'];
  joinedAt: Scalars['DateTime']['output'];
  lastRead?: Maybe<Scalars['DateTime']['output']>;
  role: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type CreateChatInput = {
  isGroup: Scalars['Boolean']['input'];
  memberIds: Array<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GetMessagesInput = {
  before?: InputMaybe<Scalars['String']['input']>;
  chatId: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
};

export type Message = {
  __typename?: 'Message';
  chatId: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  type: MessageType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type MessageType =
  | 'FILE'
  | 'IMAGE'
  | 'TEXT';

export type Mutation = {
  __typename?: 'Mutation';
  createChat: Chat;
  markMessagesAsRead: Scalars['Boolean']['output'];
  refreshTokens: AuthResponse;
  sendMessage: Message;
  signIn: AuthResponse;
  signUp: AuthResponse;
};


export type MutationCreateChatArgs = {
  input: CreateChatInput;
};


export type MutationMarkMessagesAsReadArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationRefreshTokensArgs = {
  input: RefreshTokenInput;
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSignInArgs = {
  input: SignInInput;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};

export type Query = {
  __typename?: 'Query';
  getChats: Array<Chat>;
  getMessages: Array<Message>;
};


export type QueryGetMessagesArgs = {
  input: GetMessagesInput;
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type SendMessageInput = {
  chatId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  type?: InputMaybe<MessageType>;
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  messageCreated: Message;
};


export type SubscriptionMessageCreatedArgs = {
  chatId: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastSeen?: Maybe<Scalars['DateTime']['output']>;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserStatus =
  | 'AWAY'
  | 'OFFLINE'
  | 'ONLINE';

export type GetChatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChatsQuery = { __typename?: 'Query', getChats: Array<{ __typename?: 'Chat', id: string, name?: string | null, isGroup: boolean, lastMessageAt: string, messages: Array<{ __typename?: 'Message', id: string, content: string, createdAt: string, user: { __typename?: 'User', id: string, username: string, avatarUrl?: string | null } }> }> };

export type GetChatMessagesQueryVariables = Exact<{
  input: GetMessagesInput;
}>;


export type GetChatMessagesQuery = { __typename?: 'Query', getMessages: Array<{ __typename?: 'Message', id: string, content: string, type: MessageType, metadata?: { [key: string]: any } | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, avatarUrl?: string | null, status: UserStatus } }> };

export type SendMessageMutationVariables = Exact<{
  input: SendMessageInput;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id: string, content: string, createdAt: string, user: { __typename?: 'User', id: string, username: string, avatarUrl?: string | null } } };

export type OnNewMessageSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type OnNewMessageSubscription = { __typename?: 'Subscription', messageCreated: { __typename?: 'Message', id: string, content: string, createdAt: string, user: { __typename?: 'User', id: string, username: string, avatarUrl?: string | null } } };

export type CreateChatMutationVariables = Exact<{
  input: CreateChatInput;
}>;


export type CreateChatMutation = { __typename?: 'Mutation', createChat: { __typename?: 'Chat', id: string, name?: string | null, isGroup: boolean, members: Array<{ __typename?: 'ChatMember', userId: string }> } };

export type SingInMutationVariables = Exact<{
  input: SignInInput;
}>;


export type SingInMutation = { __typename?: 'Mutation', signIn: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: string, email: string, username: string, avatarUrl?: string | null } } };

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: string, email: string, username: string, avatarUrl?: string | null } } };

export type RefreshTokensMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokensMutation = { __typename?: 'Mutation', refreshTokens: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: string, email: string, username: string, avatarUrl?: string | null } } };


export const GetChatsDocument = gql`
    query GetChats {
  getChats {
    id
    name
    isGroup
    lastMessageAt
    messages(last: 1) {
      id
      content
      createdAt
      user {
        id
        username
        avatarUrl
      }
    }
  }
}
    `;

/**
 * __useGetChatsQuery__
 *
 * To run a query within a React component, call `useGetChatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetChatsQuery(baseOptions?: Apollo.QueryHookOptions<GetChatsQuery, GetChatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatsQuery, GetChatsQueryVariables>(GetChatsDocument, options);
      }
export function useGetChatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatsQuery, GetChatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatsQuery, GetChatsQueryVariables>(GetChatsDocument, options);
        }
export function useGetChatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChatsQuery, GetChatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChatsQuery, GetChatsQueryVariables>(GetChatsDocument, options);
        }
export type GetChatsQueryHookResult = ReturnType<typeof useGetChatsQuery>;
export type GetChatsLazyQueryHookResult = ReturnType<typeof useGetChatsLazyQuery>;
export type GetChatsSuspenseQueryHookResult = ReturnType<typeof useGetChatsSuspenseQuery>;
export type GetChatsQueryResult = Apollo.QueryResult<GetChatsQuery, GetChatsQueryVariables>;
export const GetChatMessagesDocument = gql`
    query GetChatMessages($input: GetMessagesInput!) {
  getMessages(input: $input) {
    id
    content
    type
    metadata
    createdAt
    user {
      id
      username
      avatarUrl
      status
    }
  }
}
    `;

/**
 * __useGetChatMessagesQuery__
 *
 * To run a query within a React component, call `useGetChatMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChatMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChatMessagesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetChatMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables> & ({ variables: GetChatMessagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
      }
export function useGetChatMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
        }
export function useGetChatMessagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChatMessagesQuery, GetChatMessagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>(GetChatMessagesDocument, options);
        }
export type GetChatMessagesQueryHookResult = ReturnType<typeof useGetChatMessagesQuery>;
export type GetChatMessagesLazyQueryHookResult = ReturnType<typeof useGetChatMessagesLazyQuery>;
export type GetChatMessagesSuspenseQueryHookResult = ReturnType<typeof useGetChatMessagesSuspenseQuery>;
export type GetChatMessagesQueryResult = Apollo.QueryResult<GetChatMessagesQuery, GetChatMessagesQueryVariables>;
export const SendMessageDocument = gql`
    mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    createdAt
    user {
      id
      username
      avatarUrl
    }
  }
}
    `;
export type SendMessageMutationFn = Apollo.MutationFunction<SendMessageMutation, SendMessageMutationVariables>;

/**
 * __useSendMessageMutation__
 *
 * To run a mutation, you first call `useSendMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageMutation, { data, loading, error }] = useSendMessageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendMessageMutation, SendMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument, options);
      }
export type SendMessageMutationHookResult = ReturnType<typeof useSendMessageMutation>;
export type SendMessageMutationResult = Apollo.MutationResult<SendMessageMutation>;
export type SendMessageMutationOptions = Apollo.BaseMutationOptions<SendMessageMutation, SendMessageMutationVariables>;
export const OnNewMessageDocument = gql`
    subscription OnNewMessage($chatId: String!) {
  messageCreated(chatId: $chatId) {
    id
    content
    createdAt
    user {
      id
      username
      avatarUrl
    }
  }
}
    `;

/**
 * __useOnNewMessageSubscription__
 *
 * To run a query within a React component, call `useOnNewMessageSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnNewMessageSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnNewMessageSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useOnNewMessageSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnNewMessageSubscription, OnNewMessageSubscriptionVariables> & ({ variables: OnNewMessageSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnNewMessageSubscription, OnNewMessageSubscriptionVariables>(OnNewMessageDocument, options);
      }
export type OnNewMessageSubscriptionHookResult = ReturnType<typeof useOnNewMessageSubscription>;
export type OnNewMessageSubscriptionResult = Apollo.SubscriptionResult<OnNewMessageSubscription>;
export const CreateChatDocument = gql`
    mutation CreateChat($input: CreateChatInput!) {
  createChat(input: $input) {
    id
    name
    isGroup
    members {
      userId
    }
  }
}
    `;
export type CreateChatMutationFn = Apollo.MutationFunction<CreateChatMutation, CreateChatMutationVariables>;

/**
 * __useCreateChatMutation__
 *
 * To run a mutation, you first call `useCreateChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChatMutation, { data, loading, error }] = useCreateChatMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateChatMutation(baseOptions?: Apollo.MutationHookOptions<CreateChatMutation, CreateChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateChatMutation, CreateChatMutationVariables>(CreateChatDocument, options);
      }
export type CreateChatMutationHookResult = ReturnType<typeof useCreateChatMutation>;
export type CreateChatMutationResult = Apollo.MutationResult<CreateChatMutation>;
export type CreateChatMutationOptions = Apollo.BaseMutationOptions<CreateChatMutation, CreateChatMutationVariables>;
export const SingInDocument = gql`
    mutation SingIn($input: SignInInput!) {
  signIn(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      username
      avatarUrl
    }
  }
}
    `;
export type SingInMutationFn = Apollo.MutationFunction<SingInMutation, SingInMutationVariables>;

/**
 * __useSingInMutation__
 *
 * To run a mutation, you first call `useSingInMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSingInMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [singInMutation, { data, loading, error }] = useSingInMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSingInMutation(baseOptions?: Apollo.MutationHookOptions<SingInMutation, SingInMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SingInMutation, SingInMutationVariables>(SingInDocument, options);
      }
export type SingInMutationHookResult = ReturnType<typeof useSingInMutation>;
export type SingInMutationResult = Apollo.MutationResult<SingInMutation>;
export type SingInMutationOptions = Apollo.BaseMutationOptions<SingInMutation, SingInMutationVariables>;
export const SignUpDocument = gql`
    mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      username
      avatarUrl
    }
  }
}
    `;
export type SignUpMutationFn = Apollo.MutationFunction<SignUpMutation, SignUpMutationVariables>;

/**
 * __useSignUpMutation__
 *
 * To run a mutation, you first call `useSignUpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpMutation, { data, loading, error }] = useSignUpMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignUpMutation(baseOptions?: Apollo.MutationHookOptions<SignUpMutation, SignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument, options);
      }
export type SignUpMutationHookResult = ReturnType<typeof useSignUpMutation>;
export type SignUpMutationResult = Apollo.MutationResult<SignUpMutation>;
export type SignUpMutationOptions = Apollo.BaseMutationOptions<SignUpMutation, SignUpMutationVariables>;
export const RefreshTokensDocument = gql`
    mutation RefreshTokens($input: RefreshTokenInput!) {
  refreshTokens(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      username
      avatarUrl
    }
  }
}
    `;
export type RefreshTokensMutationFn = Apollo.MutationFunction<RefreshTokensMutation, RefreshTokensMutationVariables>;

/**
 * __useRefreshTokensMutation__
 *
 * To run a mutation, you first call `useRefreshTokensMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshTokensMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshTokensMutation, { data, loading, error }] = useRefreshTokensMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRefreshTokensMutation(baseOptions?: Apollo.MutationHookOptions<RefreshTokensMutation, RefreshTokensMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshTokensMutation, RefreshTokensMutationVariables>(RefreshTokensDocument, options);
      }
export type RefreshTokensMutationHookResult = ReturnType<typeof useRefreshTokensMutation>;
export type RefreshTokensMutationResult = Apollo.MutationResult<RefreshTokensMutation>;
export type RefreshTokensMutationOptions = Apollo.BaseMutationOptions<RefreshTokensMutation, RefreshTokensMutationVariables>;