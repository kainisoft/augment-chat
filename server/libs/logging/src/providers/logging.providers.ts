import { Provider } from '@nestjs/common';
// import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
// import { LoggingInterceptor } from '../interceptors/logging.interceptor';
// import { LoggingExceptionFilter } from '../filters/exception.filter';

/**
 * Providers for global logging components
 * Note: Middleware and interceptors temporarily disabled
 */
export const LoggingProviders: Provider[] = [
  // Temporarily disabled
  // {
  //   provide: APP_INTERCEPTOR,
  //   useClass: LoggingInterceptor,
  // },
  // {
  //   provide: APP_FILTER,
  //   useClass: LoggingExceptionFilter,
  // },
];
