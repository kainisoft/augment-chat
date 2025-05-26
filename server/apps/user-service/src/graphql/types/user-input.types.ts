import { Field, InputType } from '@nestjs/graphql';
import { UserStatusEnum } from '../../domain/models/value-objects/user-status.value-object';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import {
  IsUUIDField,
  IsUsernameField,
  IsDisplayNameField,
} from '@app/validation';

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
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @Field(() => String, {
    nullable: true,
    description: 'URL to user avatar image',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
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
 */
@InputType({ description: 'Input for searching users' })
export class SearchUsersInput {
  @Field(() => String, { description: 'Search term' })
  @IsString()
  searchTerm: string;

  @Field(() => Number, {
    nullable: true,
    description: 'Maximum number of results to return',
    defaultValue: 10,
  })
  @IsOptional()
  limit?: number;

  @Field(() => Number, {
    nullable: true,
    description: 'Number of results to skip',
    defaultValue: 0,
  })
  @IsOptional()
  offset?: number;
}
