/**
 * GraphQL Context Type
 *
 * This type represents the context object that is passed to all resolvers.
 */
export interface GraphQLContext {
  req: any;
  connection: any;
}

/**
 * User Model Type
 *
 * This type represents the User entity as it is stored in the database.
 */
export interface UserModel {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relationship Model Type
 *
 * This type represents the Relationship entity as it is stored in the database.
 */
export interface RelationshipModel {
  id: string;
  userId: string;
  targetId: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Setting Model Type
 *
 * This type represents the UserSetting entity as it is stored in the database.
 */
export interface UserSettingModel {
  id: string;
  userId: string;
  key: string;
  value: Record<string, any>;
  updatedAt: Date;
}
