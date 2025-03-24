import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { DataBaseModule } from './database/database.module';
import { GraphQLAppModule } from './graphql/graphql.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataBaseModule,
    AuthModule,
    GraphQLAppModule,
    UsersModule,
    ChatsModule,
  ],
})
export class AppModule {}
