import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RelationshipTypeEnum } from '../../domain/models/value-objects/relationship-type.value-object';
import { RelationshipStatusEnum } from '../../domain/models/value-objects/relationship-status.value-object';
import { UserType } from './user.types';

/**
 * Register the RelationshipType enum for GraphQL
 */
registerEnumType(RelationshipTypeEnum, {
  name: 'RelationshipType',
  description: 'Relationship type options',
});

/**
 * Register the RelationshipStatus enum for GraphQL
 */
registerEnumType(RelationshipStatusEnum, {
  name: 'RelationshipStatus',
  description: 'Relationship status options',
});

/**
 * Relationship GraphQL Type
 *
 * Represents a relationship between users in the system.
 */
@ObjectType({ description: 'Relationship between users' })
export class UserRelationship {
  @Field(() => ID, { description: 'Unique identifier for the relationship' })
  id: string;

  @Field(() => UserType, { description: 'User who initiated the relationship' })
  user: UserType;

  @Field(() => UserType, { description: 'Target user of the relationship' })
  target: UserType;

  @Field(() => RelationshipTypeEnum, { description: 'Type of relationship' })
  type: RelationshipTypeEnum;

  @Field(() => RelationshipStatusEnum, {
    description: 'Status of relationship',
  })
  status: RelationshipStatusEnum;

  @Field(() => Date, { description: 'When the relationship was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the relationship was last updated' })
  updatedAt: Date;
}

/**
 * Relationship Connection (for pagination)
 */
@ObjectType()
export class RelationshipConnection {
  @Field(() => [UserRelationship], { description: 'List of relationships' })
  nodes: UserRelationship[];

  @Field(() => Int, { description: 'Total count of relationships' })
  totalCount: number;

  @Field(() => Boolean, {
    description: 'Whether there are more relationships to fetch',
  })
  hasMore: boolean;
}
