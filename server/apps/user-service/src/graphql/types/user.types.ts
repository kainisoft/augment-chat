import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserStatusEnum } from '../../domain/models/value-objects/user-status.value-object';

/**
 * Register the UserStatus enum for GraphQL
 */
registerEnumType(UserStatusEnum, {
  name: 'UserStatus',
  description: 'User status options',
});

/**
 * User GraphQL Type
 *
 * Represents a user in the system.
 */
@ObjectType({ description: 'User profile information' })
export class UserType {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  id: string;

  @Field(() => String, { description: 'Authentication ID from Auth Service' })
  authId: string;

  @Field(() => String, { description: 'Unique username' })
  username: string;

  @Field(() => String, { description: 'Display name shown to other users' })
  displayName: string;

  @Field(() => String, { nullable: true, description: 'User biography' })
  bio?: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'URL to user avatar image',
  })
  avatarUrl?: string | null;

  @Field(() => UserStatusEnum, { description: 'Current user status' })
  status: UserStatusEnum;

  @Field(() => Date, { description: 'When the user was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the user was last updated' })
  updatedAt: Date;
}

/**
 * User Connection (for pagination)
 */
@ObjectType()
export class UserConnection {
  @Field(() => [UserType], { description: 'List of users' })
  nodes: UserType[];

  @Field(() => Int, { description: 'Total count of users' })
  totalCount: number;

  @Field(() => Boolean, {
    description: 'Whether there are more users to fetch',
  })
  hasMore: boolean;
}

/**
 * User Search Result
 */
@ObjectType({ description: 'Result of a user search' })
export class UserSearchResult {
  @Field(() => [UserType], {
    description: 'List of users matching the search criteria',
  })
  users: UserType[];

  @Field(() => Int, {
    description: 'Total count of users matching the search criteria',
  })
  totalCount: number;
}
