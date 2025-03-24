import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Message } from './message.model';

@ObjectType()
export class Chat {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Boolean)
  isGroup: boolean;

  @Field(() => Date)
  lastMessageAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => User, { nullable: true })
  createdBy?: User;

  @Field(() => [Message])
  messages: Message[];
}
