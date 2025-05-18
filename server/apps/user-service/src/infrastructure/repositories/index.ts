import { Provider } from '@nestjs/common';
import { DrizzleUserRepository } from './user.repository';
import { DrizzleUserReadRepository } from './user-read.repository';

/**
 * Repository providers for dependency injection
 */
export const RepositoryProviders: Provider[] = [
  // Write repositories
  {
    provide: 'UserRepository',
    useClass: DrizzleUserRepository,
  },

  // Read repositories
  {
    provide: 'UserReadRepository',
    useClass: DrizzleUserReadRepository,
  },
];
