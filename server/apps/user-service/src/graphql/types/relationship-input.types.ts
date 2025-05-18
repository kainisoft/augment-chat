import { Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { RelationshipTypeEnum } from '../../domain/models/value-objects/relationship-type.value-object';
import { RelationshipStatusEnum } from '../../domain/models/value-objects/relationship-status.value-object';

/**
 * Create Relationship Input
 *
 * Input type for creating a new relationship.
 */
@InputType({ description: 'Input for creating a new relationship' })
export class CreateRelationshipInput {
  @Field(() => String, { description: 'Target user ID' })
  @IsString()
  @IsUUID('4')
  targetId: string;

  @Field(() => RelationshipTypeEnum, { description: 'Type of relationship' })
  @IsEnum(RelationshipTypeEnum)
  type: RelationshipTypeEnum;
}

/**
 * Update Relationship Input
 *
 * Input type for updating a relationship.
 */
@InputType({ description: 'Input for updating a relationship' })
export class UpdateRelationshipInput {
  @Field(() => RelationshipStatusEnum, {
    description: 'New status of relationship',
  })
  @IsEnum(RelationshipStatusEnum)
  status: RelationshipStatusEnum;
}

/**
 * Get User Relationships Input
 *
 * Input type for getting user relationships.
 */
@InputType({ description: 'Input for getting user relationships' })
export class GetUserRelationshipsInput {
  @Field(() => String, { description: 'User ID' })
  @IsString()
  @IsUUID('4')
  userId: string;

  @Field(() => RelationshipTypeEnum, {
    nullable: true,
    description: 'Filter by relationship type',
  })
  @IsOptional()
  @IsEnum(RelationshipTypeEnum)
  type?: RelationshipTypeEnum;

  @Field(() => Number, {
    nullable: true,
    description: 'Maximum number of results to return',
    defaultValue: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => Number, {
    nullable: true,
    description: 'Number of results to skip',
    defaultValue: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
