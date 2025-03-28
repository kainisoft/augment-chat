import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateChatInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => Boolean)
  @IsBoolean()
  isGroup: boolean;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  memberIds: string[];
}
