/**
 * Core GraphQL Barrel Exports
 * 
 * Provides clean, tree-shakable exports for all GraphQL-related services.
 * Use named imports to maintain optimal bundle size.
 */

// GraphQL Configuration & Services
export { ApolloConfigService } from './apollo.config';
export { GraphQLService } from './graphql.service';
export { provideApollo, injectApollo } from './apollo.provider';
