import { Provider } from '@nestjs/common';
import { DrizzleUserRepository } from './user.repository';

/**
 * Repository providers for dependency injection
 */
export const RepositoryProviders: Provider[] = [
  {
    provide: 'UserRepository',
    useClass: DrizzleUserRepository,
  },
];
