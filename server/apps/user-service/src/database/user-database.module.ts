import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { UserDatabaseService } from './user-database.service';

/**
 * User Database Module
 *
 * Module for database integration in the User Service.
 */
@Module({
  imports: [DatabaseModule.forUser()],
  providers: [UserDatabaseService],
  exports: [UserDatabaseService],
})
export class UserDatabaseModule {}
