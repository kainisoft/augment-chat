import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ChatsModule } from '../chats/chats.module';
import { HealthResolver } from './health.resolver';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      include: [AuthModule, ChatsModule],
      subscriptions: {
        'graphql-ws': {
          path: '/graphql/subscriptions',
        },
      },
    }),
  ],
  providers: [HealthResolver],
})
export class GraphQLAppModule {}
