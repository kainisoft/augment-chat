import { Provider } from '@nestjs/common';
import { DrizzleUserRepository } from './user.repository';
import { DrizzleUserAuthReadRepository } from './user-auth-read.repository';
import { TokenValidationReadRepositoryImpl } from './token-validation-read.repository';

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
    provide: 'UserAuthReadRepository',
    useClass: DrizzleUserAuthReadRepository,
  },
  {
    provide: 'TokenValidationReadRepository',
    useClass: TokenValidationReadRepositoryImpl,
  },
];
