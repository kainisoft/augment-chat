import { ErrorLogMetadata, BaseLogMetadata } from '@app/logging';
import { AppError, ErrorFactory } from '@app/common/errors';

/**
 * Creates error metadata for logging
 * @param error The error object
 * @param additionalMetadata Additional metadata to include
 * @returns ErrorLogMetadata object
 */
export function createErrorMetadata(
  error: any,
  additionalMetadata: Record<string, any> = {},
): ErrorLogMetadata {
  // Convert to AppError if it's not already
  const appError =
    error instanceof AppError ? error : ErrorFactory.fromError(error);

  return {
    errorName: appError.name,
    errorCode: appError.code,
    stack: appError.stack,
    statusCode: appError.statusCode,
    ...(appError.metadata || {}),
    ...additionalMetadata,
  };
}

/**
 * Creates auth metadata for logging
 * @param userId User ID
 * @param action Action performed
 * @param success Whether the action was successful
 * @param additionalMetadata Additional metadata to include
 * @returns AuthLogMetadata object
 */
export function createAuthMetadata(
  userId: string,
  action: string,
  success: boolean = true,
  additionalMetadata: Record<string, any> = {},
): BaseLogMetadata {
  return {
    userId,
    action,
    success,
    ...additionalMetadata,
  };
}
