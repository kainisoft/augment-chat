import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  username: string;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => Date, { nullable: true })
  lastSeen?: Date;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
