import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersRepository } from './users.repository';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Query(() => [User])
  async searchUsers(@CurrentUser() currentUserId: string, @Args('query') query: string) {
    return this.usersRepository.searchUsers(query, currentUserId);
  }
}
