import { randomUUID } from 'crypto';
import { UserId } from '@app/domain';
import {
  RelationshipType,
  RelationshipTypeEnum,
} from './value-objects/relationship-type.value-object';
import {
  RelationshipStatus,
  RelationshipStatusEnum,
} from './value-objects/relationship-status.value-object';

/**
 * Relationship Entity Props
 *
 * Properties required to create a Relationship entity.
 */
export interface RelationshipProps {
  id?: string;
  userId: UserId;
  targetId: UserId;
  type: RelationshipType;
  status: RelationshipStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Relationship Entity
 *
 * Represents a relationship between two users in the system.
 */
export class Relationship {
  private readonly id: string;
  private readonly userId: UserId;
  private readonly targetId: UserId;
  private type: RelationshipType;
  private status: RelationshipStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  /**
   * Create a new Relationship entity
   * @param props - The relationship properties
   */
  constructor(props: RelationshipProps) {
    this.id = props.id || randomUUID();
    this.userId = props.userId;
    this.targetId = props.targetId;
    this.type = props.type;
    this.status = props.status;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Get the relationship ID
   * @returns The relationship ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get the user ID
   * @returns The user ID
   */
  getUserId(): UserId {
    return this.userId;
  }

  /**
   * Get the target user ID
   * @returns The target user ID
   */
  getTargetId(): UserId {
    return this.targetId;
  }

  /**
   * Get the relationship type
   * @returns The relationship type
   */
  getType(): RelationshipType {
    return this.type;
  }

  /**
   * Update the relationship type
   * @param type - The new relationship type
   */
  updateType(type: RelationshipType): void {
    this.type = type;
    this.updatedAt = new Date();
  }

  /**
   * Get the relationship status
   * @returns The relationship status
   */
  getStatus(): RelationshipStatus {
    return this.status;
  }

  /**
   * Update the relationship status
   * @param status - The new relationship status
   */
  updateStatus(status: RelationshipStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Accept the relationship
   * Only valid for PENDING relationships
   */
  accept(): void {
    if (this.status.toString() !== RelationshipStatusEnum.PENDING) {
      throw new Error('Only pending relationships can be accepted');
    }
    this.status = new RelationshipStatus(RelationshipStatusEnum.ACCEPTED);
    this.updatedAt = new Date();
  }

  /**
   * Reject the relationship
   * Only valid for PENDING relationships
   */
  reject(): void {
    if (this.status.toString() !== RelationshipStatusEnum.PENDING) {
      throw new Error('Only pending relationships can be rejected');
    }
    this.status = new RelationshipStatus(RelationshipStatusEnum.REJECTED);
    this.updatedAt = new Date();
  }

  /**
   * Block the relationship
   * Changes the type to BLOCKED and status to ACCEPTED
   */
  block(): void {
    this.type = new RelationshipType(RelationshipTypeEnum.BLOCKED);
    this.status = new RelationshipStatus(RelationshipStatusEnum.ACCEPTED);
    this.updatedAt = new Date();
  }

  /**
   * Get the creation date
   * @returns The creation date
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Get the last update date
   * @returns The last update date
   */
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
