import { Field, InputType } from '@nestjs/graphql';
import { UserStatusEnum } from '../../domain/models/value-objects/user-status.value-object';
import { IsOptional, IsEnum } from 'class-validator';
import {
  IsUUIDField,
  IsUsernameField,
  IsDisplayNameField,
  IsBioField,
  IsAvatarUrlField,
} from '@app/validation';
import { GraphQLSearchPaginationInput } from '@app/dtos/graphql/pagination-input.dto';

/**
 * Create User Input
 *
 * Input type for creating a new user.
 */
@InputType({ description: 'Input for creating a new user' })
export class CreateUserInput {
  @Field(() => String, { description: 'Authentication ID from Auth Service' })
  @IsUUIDField({
    description: 'Authentication ID from Auth Service',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  authId: string;

  @Field(() => String, { description: 'Unique username' })
  @IsUsernameField({
    description: 'Unique username',
    example: 'john_doe',
  })
  username: string;

  @Field(() => String, {
    nullable: true,
    description: 'Display name shown to other users',
  })
  @IsOptional()
  @IsDisplayNameField({
    description: 'Display name shown to other users',
    example: 'John Doe',
    required: false,
  })
  displayName?: string;
}

/**
 * Update User Profile Input
 *
 * Input type for updating a user's profile.
 */
@InputType({ description: 'Input for updating a user profile' })
export class UpdateUserProfileInput {
  @Field(() => String, { description: 'User ID' })
  @IsUUIDField({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @Field(() => String, {
    nullable: true,
    description: 'Display name shown to other users',
  })
  @IsOptional()
  @IsDisplayNameField({
    description: 'Display name shown to other users',
    example: 'John Doe',
    required: false,
  })
  displayName?: string;

  @Field(() => String, { nullable: true, description: 'User biography' })
  @IsBioField({
    description: 'User biography',
    example:
      'Software developer passionate about creating amazing user experiences.',
    required: false,
  })
  bio?: string;

  @Field(() => String, {
    nullable: true,
    description: 'URL to user avatar image',
  })
  @IsAvatarUrlField({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;
}

/**
 * Update User Status Input
 *
 * Input type for updating a user's status.
 */
@InputType({ description: 'Input for updating a user status' })
export class UpdateUserStatusInput {
  @Field(() => String, { description: 'User ID' })
  @IsUUIDField({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @Field(() => UserStatusEnum, { description: 'New user status' })
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}

/**
 * Search Users Input
 *
 * Input type for searching users.
 * Extends the shared GraphQL search pagination input for consistency.
 */
@InputType({ description: 'Input for searching users' })
export class SearchUsersInput extends GraphQLSearchPaginationInput {
  // searchTerm is inherited from GraphQLSearchPaginationInput
  // limit and offset are inherited with proper validation
}
