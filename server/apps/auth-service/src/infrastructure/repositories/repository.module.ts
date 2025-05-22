import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { RepositoryProviders } from './index';
import { CacheModule } from '../../cache/cache.module';
import { TokenService } from '../../token/token.service';

/**
 * Repository Module
 *
 * Module for repository providers.
 */
@Module({
  imports: [DatabaseModule.forAuth(), LoggingModule, CacheModule],
  providers: [...RepositoryProviders, TokenService],
  exports: [...RepositoryProviders, TokenService],
})
export class RepositoryModule {}
