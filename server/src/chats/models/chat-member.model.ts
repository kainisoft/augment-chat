import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class ChatMember {
  @Field(() => ID)
  chatId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => String)
  role: string;

  @Field(() => Date)
  joinedAt: Date;

  @Field(() => Date, { nullable: true })
  lastRead?: Date;

  @Field(() => User)
  user: User;
}