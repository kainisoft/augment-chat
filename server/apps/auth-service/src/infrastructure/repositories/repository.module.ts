import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { RepositoryProviders } from './index';
import { CacheModule } from '../../cache/cache.module';
import { TokenModule } from '../../token/token.module';

/**
 * Repository Module
 *
 * Module for repository providers.
 */
@Module({
  imports: [DatabaseModule.forAuth(), LoggingModule, CacheModule, TokenModule],
  providers: [...RepositoryProviders],
  exports: [...RepositoryProviders],
})
export class RepositoryModule {}
