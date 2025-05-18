/**
 * Update Relationship Command
 *
 * Command to update an existing relationship between users.
 */
export class UpdateRelationshipCommand {
  constructor(
    public readonly relationshipId: string,
    public readonly status: string,
  ) {}
}
