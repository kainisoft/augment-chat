import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';

@Module({
  providers: [UsersResolver, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
