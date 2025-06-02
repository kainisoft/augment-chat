import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { UserProfileReadModel } from '../../domain/read-models/user-profile.read-model';
import { RelationshipReadModel } from '../../domain/read-models/relationship.read-model';
import { GraphQLContext } from '../types/graphql-context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: Date; output: Date; }
  link__Import: { input: any; output: any; }
};

/** Input for creating a new relationship */
export type CreateRelationshipInput = {
  /** Target user ID */
  targetId: Scalars['String']['input'];
  /** Type of relationship */
  type: RelationshipType;
};

/** Input for creating a new user */
export type CreateUserInput = {
  /** Authentication ID from Auth Service */
  authId: Scalars['String']['input'];
  /** Display name shown to other users */
  displayName: InputMaybe<Scalars['String']['input']>;
  /** Unique username */
  username: Scalars['String']['input'];
};

/** Input for getting user relationships */
export type GetUserRelationshipsInput = {
  /** Maximum number of results to return */
  limit: InputMaybe<Scalars['Float']['input']>;
  /** Number of results to skip */
  offset: InputMaybe<Scalars['Float']['input']>;
  /** Filter by relationship type */
  type: InputMaybe<RelationshipType>;
  /** User ID */
  userId: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new relationship */
  createRelationship: UserRelationship;
  /** Create a new user */
  createUser: UserType;
  /** Delete a relationship */
  deleteRelationship: Scalars['Boolean']['output'];
  /** Update a relationship */
  updateRelationship: UserRelationship;
  /** Update a user profile */
  updateUserProfile: UserType;
  /** Update a user status */
  updateUserStatus: UserType;
};


export type MutationCreateRelationshipArgs = {
  input: CreateRelationshipInput;
  userId: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteRelationshipArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateRelationshipArgs = {
  id: Scalars['String']['input'];
  input: UpdateRelationshipInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUpdateUserStatusArgs = {
  input: UpdateUserStatusInput;
};

export type Query = {
  __typename?: 'Query';
  /** A simple hello world query */
  hello: Scalars['String']['output'];
  /** Get a relationship by its unique identifier */
  relationship: Maybe<UserRelationship>;
  /** Search for users by username or display name */
  searchUsers: UserSearchResult;
  /** Get a user by ID */
  user: Maybe<UserType>;
  /** Get a user by username */
  userByUsername: Maybe<UserType>;
  /** Get friends for a user */
  userFriends: RelationshipConnection;
  /** Get relationships for a user */
  userRelationships: RelationshipConnection;
};


export type QueryRelationshipArgs = {
  id: Scalars['String']['input'];
};


export type QuerySearchUsersArgs = {
  input: SearchUsersInput;
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserByUsernameArgs = {
  username: Scalars['String']['input'];
};


export type QueryUserFriendsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  userId: Scalars['String']['input'];
};


export type QueryUserRelationshipsArgs = {
  input: GetUserRelationshipsInput;
};

export type RelationshipConnection = {
  __typename?: 'RelationshipConnection';
  /** Whether there are more relationships to fetch */
  hasMore: Scalars['Boolean']['output'];
  /** List of relationships */
  nodes: Array<UserRelationship>;
  /** Total count of relationships */
  totalCount: Scalars['Int']['output'];
};

/** Relationship status options */
export type RelationshipStatus =
  | 'ACCEPTED'
  | 'PENDING'
  | 'REJECTED';

/** Relationship type options */
export type RelationshipType =
  | 'BLOCKED'
  | 'FRIEND';

/** Input for searching users */
export type SearchUsersInput = {
  /** Maximum number of items to return */
  limit: InputMaybe<Scalars['Int']['input']>;
  /** Number of items to skip */
  offset: InputMaybe<Scalars['Int']['input']>;
  /** Search term to filter results */
  searchTerm: Scalars['String']['input'];
};

/** Input for updating a relationship */
export type UpdateRelationshipInput = {
  /** New status of relationship */
  status: RelationshipStatus;
};

/** Input for updating a user profile */
export type UpdateUserProfileInput = {
  /** URL to user avatar image */
  avatarUrl: InputMaybe<Scalars['String']['input']>;
  /** User biography */
  bio: InputMaybe<Scalars['String']['input']>;
  /** Display name shown to other users */
  displayName: InputMaybe<Scalars['String']['input']>;
  /** User ID */
  userId: Scalars['String']['input'];
};

/** Input for updating a user status */
export type UpdateUserStatusInput = {
  /** New user status */
  status: UserStatus;
  /** User ID */
  userId: Scalars['String']['input'];
};

/** Relationship between users */
export type UserRelationship = {
  __typename?: 'UserRelationship';
  /** When the relationship was created */
  createdAt: Scalars['DateTime']['output'];
  /** Unique identifier for the relationship */
  id: Scalars['ID']['output'];
  /** Status of relationship */
  status: RelationshipStatus;
  target: UserType;
  /** Type of relationship */
  type: RelationshipType;
  /** When the relationship was last updated */
  updatedAt: Scalars['DateTime']['output'];
  user: UserType;
};

/** Result of a user search */
export type UserSearchResult = {
  __typename?: 'UserSearchResult';
  /** Number of items returned */
  count: Scalars['Int']['output'];
  /** Whether there are more items */
  hasMore: Scalars['Boolean']['output'];
  /** List of users matching the search criteria */
  items: Array<UserType>;
  /** Limit used for this query */
  limit: Scalars['Int']['output'];
  /** Current offset */
  offset: Scalars['Int']['output'];
  /** Search term used */
  searchTerm: Scalars['String']['output'];
  /** Time taken for search in milliseconds */
  searchTime: Scalars['Int']['output'];
  /** Total number of items */
  totalCount: Scalars['Int']['output'];
};

/** User status options */
export type UserStatus =
  | 'AWAY'
  | 'DO_NOT_DISTURB'
  | 'OFFLINE'
  | 'ONLINE';

/** User profile information */
export type UserType = {
  __typename?: 'UserType';
  /** Authentication ID from Auth Service */
  authId: Scalars['String']['output'];
  /** URL to user avatar image */
  avatarUrl: Maybe<Scalars['String']['output']>;
  /** User biography */
  bio: Maybe<Scalars['String']['output']>;
  /** When the user was created */
  createdAt: Scalars['DateTime']['output'];
  /** Display name shown to other users */
  displayName: Scalars['String']['output'];
  /** Unique identifier for the user */
  id: Scalars['ID']['output'];
  /** Current user status */
  status: UserStatus;
  /** When the user was last updated */
  updatedAt: Scalars['DateTime']['output'];
  /** Unique username */
  username: Scalars['String']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateRelationshipInput: CreateRelationshipInput;
  CreateUserInput: CreateUserInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GetUserRelationshipsInput: GetUserRelationshipsInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  RelationshipConnection: ResolverTypeWrapper<Omit<RelationshipConnection, 'nodes'> & { nodes: Array<ResolversTypes['UserRelationship']> }>;
  RelationshipStatus: RelationshipStatus;
  RelationshipType: RelationshipType;
  SearchUsersInput: SearchUsersInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateRelationshipInput: UpdateRelationshipInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserStatusInput: UpdateUserStatusInput;
  UserRelationship: ResolverTypeWrapper<RelationshipReadModel>;
  UserSearchResult: ResolverTypeWrapper<Omit<UserSearchResult, 'items'> & { items: Array<ResolversTypes['UserType']> }>;
  UserStatus: UserStatus;
  UserType: ResolverTypeWrapper<UserProfileReadModel>;
  link__Import: ResolverTypeWrapper<Scalars['link__Import']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  CreateRelationshipInput: CreateRelationshipInput;
  CreateUserInput: CreateUserInput;
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  GetUserRelationshipsInput: GetUserRelationshipsInput;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  RelationshipConnection: Omit<RelationshipConnection, 'nodes'> & { nodes: Array<ResolversParentTypes['UserRelationship']> };
  SearchUsersInput: SearchUsersInput;
  String: Scalars['String']['output'];
  UpdateRelationshipInput: UpdateRelationshipInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserStatusInput: UpdateUserStatusInput;
  UserRelationship: RelationshipReadModel;
  UserSearchResult: Omit<UserSearchResult, 'items'> & { items: Array<ResolversParentTypes['UserType']> };
  UserType: UserProfileReadModel;
  link__Import: Scalars['link__Import']['output'];
}>;

export type ExtendsDirectiveArgs = { };

export type ExtendsDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = ExtendsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ExternalDirectiveArgs = { };

export type ExternalDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = ExternalDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type InaccessibleDirectiveArgs = { };

export type InaccessibleDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = InaccessibleDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type KeyDirectiveArgs = {
  fields: Scalars['String']['input'];
  resolvable?: Maybe<Scalars['Boolean']['input']>;
};

export type KeyDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = KeyDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LinkDirectiveArgs = {
  import: Maybe<Array<Maybe<Scalars['link__Import']['input']>>>;
  url: Scalars['String']['input'];
};

export type LinkDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = LinkDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type OverrideDirectiveArgs = {
  from: Scalars['String']['input'];
  label: Maybe<Scalars['String']['input']>;
};

export type OverrideDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = OverrideDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ProvidesDirectiveArgs = {
  fields: Scalars['String']['input'];
};

export type ProvidesDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = ProvidesDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type RequiresDirectiveArgs = {
  fields: Scalars['String']['input'];
};

export type RequiresDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = RequiresDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ShareableDirectiveArgs = { };

export type ShareableDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = ShareableDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type TagDirectiveArgs = {
  name: Scalars['String']['input'];
};

export type TagDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = TagDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createRelationship: Resolver<ResolversTypes['UserRelationship'], ParentType, ContextType, RequireFields<MutationCreateRelationshipArgs, 'input' | 'userId'>>;
  createUser: Resolver<ResolversTypes['UserType'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  deleteRelationship: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteRelationshipArgs, 'id'>>;
  updateRelationship: Resolver<ResolversTypes['UserRelationship'], ParentType, ContextType, RequireFields<MutationUpdateRelationshipArgs, 'id' | 'input'>>;
  updateUserProfile: Resolver<ResolversTypes['UserType'], ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
  updateUserStatus: Resolver<ResolversTypes['UserType'], ParentType, ContextType, RequireFields<MutationUpdateUserStatusArgs, 'input'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  hello: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  relationship: Resolver<Maybe<ResolversTypes['UserRelationship']>, ParentType, ContextType, RequireFields<QueryRelationshipArgs, 'id'>>;
  searchUsers: Resolver<ResolversTypes['UserSearchResult'], ParentType, ContextType, RequireFields<QuerySearchUsersArgs, 'input'>>;
  user: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userByUsername: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<QueryUserByUsernameArgs, 'username'>>;
  userFriends: Resolver<ResolversTypes['RelationshipConnection'], ParentType, ContextType, RequireFields<QueryUserFriendsArgs, 'limit' | 'offset' | 'userId'>>;
  userRelationships: Resolver<ResolversTypes['RelationshipConnection'], ParentType, ContextType, RequireFields<QueryUserRelationshipsArgs, 'input'>>;
}>;

export type RelationshipConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RelationshipConnection'] = ResolversParentTypes['RelationshipConnection']> = ResolversObject<{
  hasMore: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nodes: Resolver<Array<ResolversTypes['UserRelationship']>, ParentType, ContextType>;
  totalCount: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserRelationshipResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserRelationship'] = ResolversParentTypes['UserRelationship']> = ResolversObject<{
  createdAt: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status: Resolver<ResolversTypes['RelationshipStatus'], ParentType, ContextType>;
  target: Resolver<ResolversTypes['UserType'], ParentType, ContextType>;
  type: Resolver<ResolversTypes['RelationshipType'], ParentType, ContextType>;
  updatedAt: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user: Resolver<ResolversTypes['UserType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSearchResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserSearchResult'] = ResolversParentTypes['UserSearchResult']> = ResolversObject<{
  count: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hasMore: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items: Resolver<Array<ResolversTypes['UserType']>, ParentType, ContextType>;
  limit: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offset: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  searchTerm: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  searchTime: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalCount: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserTypeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserType'] = ResolversParentTypes['UserType']> = ResolversObject<{
  authId: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  avatarUrl: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  displayName: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status: Resolver<ResolversTypes['UserStatus'], ParentType, ContextType>;
  updatedAt: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  username: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Link__ImportScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['link__Import'], any> {
  name: 'link__Import';
}

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  DateTime: GraphQLScalarType;
  Mutation: MutationResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  RelationshipConnection: RelationshipConnectionResolvers<ContextType>;
  UserRelationship: UserRelationshipResolvers<ContextType>;
  UserSearchResult: UserSearchResultResolvers<ContextType>;
  UserType: UserTypeResolvers<ContextType>;
  link__Import: GraphQLScalarType;
}>;

export type DirectiveResolvers<ContextType = GraphQLContext> = ResolversObject<{
  extends: ExtendsDirectiveResolver<any, any, ContextType>;
  external: ExternalDirectiveResolver<any, any, ContextType>;
  inaccessible: InaccessibleDirectiveResolver<any, any, ContextType>;
  key: KeyDirectiveResolver<any, any, ContextType>;
  link: LinkDirectiveResolver<any, any, ContextType>;
  override: OverrideDirectiveResolver<any, any, ContextType>;
  provides: ProvidesDirectiveResolver<any, any, ContextType>;
  requires: RequiresDirectiveResolver<any, any, ContextType>;
  shareable: ShareableDirectiveResolver<any, any, ContextType>;
  tag: TagDirectiveResolver<any, any, ContextType>;
}>;
