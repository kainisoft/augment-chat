import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import GraphQLJSON from 'graphql-type-json';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

registerEnumType(MessageType, {
  name: 'MessageType',
});

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  chatId: string;

  @Field(() => String)
  content: string;

  @Field(() => MessageType)
  type: MessageType;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field(() => User)
  user: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
