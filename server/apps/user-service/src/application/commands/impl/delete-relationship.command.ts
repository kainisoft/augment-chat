/**
 * Delete Relationship Command
 *
 * Command to delete an existing relationship between users.
 */
export class DeleteRelationshipCommand {
  constructor(public readonly relationshipId: string) {}
}
