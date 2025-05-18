import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { RepositoryProviders } from './index';

/**
 * Repository Module
 *
 * Module for repository providers.
 */
@Module({
  imports: [DatabaseModule.forUser(), LoggingModule],
  providers: [...RepositoryProviders],
  exports: [...RepositoryProviders],
})
export class RepositoryModule {}
