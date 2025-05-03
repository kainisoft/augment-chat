import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { Provider } from '@nestjs/common';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { LoggingExceptionFilter } from '../filters/exception.filter';

/**
 * Providers for global logging components
 */
export const LoggingProviders: Provider[] = [
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: LoggingExceptionFilter,
  },
];
