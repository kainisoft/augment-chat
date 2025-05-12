import { InfrastructureError, ErrorCode } from '../index';

/**
 * Database connection error
 *
 * Represents an error that occurs when connecting to a database.
 */
export class DatabaseConnectionError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DATABASE_CONNECTION_ERROR, 500, metadata, cause);
  }
}

/**
 * Database query error
 *
 * Represents an error that occurs when executing a database query.
 */
export class DatabaseQueryError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DATABASE_QUERY_ERROR, 500, metadata, cause);
  }
}

/**
 * Database transaction error
 *
 * Represents an error that occurs during a database transaction.
 */
export class DatabaseTransactionError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DATABASE_TRANSACTION_ERROR, 500, metadata, cause);
  }
}

/**
 * Database constraint violation error
 *
 * Represents an error that occurs when a database constraint is violated.
 */
export class DatabaseConstraintError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DATABASE_CONSTRAINT_ERROR, 400, metadata, cause);
  }
}

/**
 * Database migration error
 *
 * Represents an error that occurs during database migration.
 */
export class DatabaseMigrationError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DATABASE_MIGRATION_ERROR, 500, metadata, cause);
  }
}

/**
 * Repository error
 *
 * Represents an error that occurs in a repository.
 */
export class RepositoryError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.REPOSITORY_ERROR, 500, metadata, cause);
  }
}
