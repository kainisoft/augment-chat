import { AuthModule } from '@/auth/auth.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ChatsModule } from '../chats/chats.module';
import { HealthResolver } from './health.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      include: [AuthModule, ChatsModule],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      resolvers: { JSON: GraphQLJSON },
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
