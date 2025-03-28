import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetMessagesInput {
  @Field(() => String)
  @IsString()
  chatId: string;

  @Field(() => Int)
  @IsNumber()
  limit: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  before?: string;
}
