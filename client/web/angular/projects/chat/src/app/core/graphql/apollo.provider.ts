import { inject } from '@angular/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloConfigService } from './apollo.config';

/**
 * Provides Apollo GraphQL client configuration for the Angular application
 */
export function provideApollo() {
  return [
    {
      provide: APOLLO_OPTIONS,
      useFactory: () => {
        const apolloConfig = inject(ApolloConfigService);
        return apolloConfig.createApolloOptions();
      },
    },
  ];
}

/**
 * Apollo GraphQL service for dependency injection
 * This can be injected into components and services that need GraphQL functionality
 */
export function injectApollo() {
  return inject(Apollo);
}
