import { Field, ID, ObjectType, Directive } from '@nestjs/graphql';

/**
 * User Type Extension for Apollo Federation
 *
 * This extends the User entity from the User Service to enable
 * cross-service references in Chat Service. The User entity is
 * owned by the User Service, but we can reference it here.
 *
 * The @extends directive indicates this is an extension of an entity
 * defined in another service. The @external directive marks fields
 * that are resolved by the owning service.
 */
@ObjectType({
  description: 'User profile information (extended from User Service)',
})
@Directive('@extends')
@Directive('@key(fields: "id")')
export class UserType {
  @Field(() => ID, { description: 'Unique identifier for the user' })
  @Directive('@external')
  id: string;

  @Field(() => String, { description: 'Unique username' })
  @Directive('@external')
  username: string;

  @Field(() => String, { description: 'Display name shown to other users' })
  @Directive('@external')
  displayName: string;

  @Field(() => String, {
    nullable: true,
    description: 'URL to user avatar image',
  })
  @Directive('@external')
  avatarUrl?: string | null;
}
