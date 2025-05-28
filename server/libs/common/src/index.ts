export * from './common.module';
export * from './common.service';
export * from './health/health.controller';
export * from './bootstrap/bootstrap.service';
export * from './config';
export * from './errors';

// Centralized utilities to eliminate duplicate code patterns
export * from './utils/string.util';
export * from './utils/date.util';
export * from './utils/validation.util';
export * from './utils/error-handling.util';
export * from './utils/type-safety.util';
export * from './utils/module-loading.util';
