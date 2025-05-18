import { Field, InputType } from '@nestjs/graphql';
import { UserStatusEnum } from '../../domain/models/value-objects/user-status.value-object';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * Create User Input
 *
 * Input type for creating a new user.
 */
@InputType({ description: 'Input for creating a new user' })
export class CreateUserInput {
  @Field(() => String, { description: 'Authentication ID from Auth Service' })
  @IsString()
  @IsUUID('4')
  authId: string;

  @Field(() => String, { description: 'Unique username' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  @MaxLength(50)
  username: string;

  @Field(() => String, {
    nullable: true,
    description: 'Display name shown to other users',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
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
  @IsString()
  @IsUUID('4')
  userId: string;

  @Field(() => String, {
    nullable: true,
    description: 'Display name shown to other users',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
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
  @IsString()
  @IsUUID('4')
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
