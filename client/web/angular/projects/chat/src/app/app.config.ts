import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withPreloading, withRouterConfig, NoPreloading } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideApollo } from './core/graphql/apollo.provider';
import { storeProviders } from './store/store.config';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { provideApp } from './core/providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(NoPreloading),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always',
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),

    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    // App Providers
    provideApp(),

    // Apollo GraphQL
    provideApollo(),

    // NgRx Store
    ...storeProviders,
  ],
};
