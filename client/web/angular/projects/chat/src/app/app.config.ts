import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, withRouterConfig, NoPreloading } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideApollo } from './core/graphql/apollo.provider';
import { storeProviders } from './store/store.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withPreloading(NoPreloading),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
        paramsInheritanceStrategy: 'always'
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    ...provideApollo(),
    ...storeProviders,
  ],
};
