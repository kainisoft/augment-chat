import { DomainError, ErrorCode } from '../index';

/**
 * Business rule violation error
 *
 * Represents an error that occurs when a business rule is violated.
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.BUSINESS_RULE_VIOLATION, 400, metadata, cause);
  }
}

/**
 * Entity state error
 *
 * Represents an error that occurs when an entity is in an invalid state
 * for a requested operation.
 */
export class EntityStateError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.ENTITY_STATE_ERROR, 400, metadata, cause);
  }
}

/**
 * Entity relationship error
 *
 * Represents an error that occurs when there's an issue with entity relationships.
 */
export class EntityRelationshipError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.ENTITY_RELATIONSHIP_ERROR, 400, metadata, cause);
  }
}

/**
 * Domain service error
 *
 * Represents an error that occurs in a domain service.
 */
export class DomainServiceError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DOMAIN_SERVICE_ERROR, 500, metadata, cause);
  }
}

/**
 * Value object error
 *
 * Represents an error that occurs when creating or manipulating a value object.
 */
export class ValueObjectError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.VALUE_OBJECT_ERROR, 400, metadata, cause);
  }
}

/**
 * Aggregate root error
 *
 * Represents an error that occurs when manipulating an aggregate root.
 */
export class AggregateRootError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.AGGREGATE_ROOT_ERROR, 400, metadata, cause);
  }
}
