import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { AuthServiceController } from './controllers/auth-service.controller';
import { AuthController } from './controllers/auth.controller';
import { SessionController } from './controllers/session.controller';
import { AuthServiceService } from './services/auth-service.service';
import { RedisModule } from '@app/redis';

import { RepositoryModule } from '../infrastructure/repositories/repository.module';

@Module({
  imports: [CqrsModule, LoggingModule, RedisModule, RepositoryModule],
  controllers: [AuthServiceController, AuthController, SessionController],
  providers: [AuthServiceService],
  exports: [],
})
export class PresentationModule {}
