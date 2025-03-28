import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsJSON, IsOptional, IsString } from 'class-validator';
import { MessageType } from '../models/message.model';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class SendMessageInput {
  @Field(() => String)
  @IsString()
  chatId: string;

  @Field(() => String)
  @IsString()
  content: string;

  @Field(() => MessageType, { nullable: true })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsJSON()
  @IsOptional()
  metadata?: Record<string, any>;
}
