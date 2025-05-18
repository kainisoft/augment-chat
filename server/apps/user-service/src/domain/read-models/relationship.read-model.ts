/**
 * Relationship Read Model
 *
 * Data Transfer Object (DTO) for relationship information.
 * Used for query operations in CQRS.
 */
export interface RelationshipReadModel {
  id: string;
  userId: string;
  targetId: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
