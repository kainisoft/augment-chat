import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ChatsModule } from './chats/chats.module';
import { DataBaseModule } from './database/database.module';
import { HealthResolver } from './graphql/health.resolver';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataBaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': {
          path: '/graphql/subscriptions',
        },
      },
    }),
    UsersModule,
    ChatsModule,
  ],
  providers: [HealthResolver],
})
export class AppModule {}
