import { Field, ID, ObjectType, registerEnumType, Directive } from '@nestjs/graphql';
import { UserStatusEnum } from '../../domain/models/value-objects/user-status.value-object';
import {
  GraphQLListResponse,
  GraphQLSearchResponse,
} from '@app/dtos/graphql/pagination-response.dto';

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
 * Enhanced for Apollo Federation with @key directive for entity resolution.
 */
@ObjectType({ description: 'User profile information' })
@Directive('@key(fields: "id")')
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
 *
 * Extends the shared GraphQL list response for consistency.
 */
@ObjectType({ description: 'Paginated list of users' })
export class UserConnection extends GraphQLListResponse<UserType> {
  @Field(() => [UserType], { description: 'List of users' })
  items: UserType[];
}

/**
 * User Search Result
 *
 * Extends the shared GraphQL search response for consistency.
 */
@ObjectType({ description: 'Result of a user search' })
export class UserSearchResult extends GraphQLSearchResponse<UserType> {
  @Field(() => [UserType], {
    description: 'List of users matching the search criteria',
  })
  items: UserType[];
}
