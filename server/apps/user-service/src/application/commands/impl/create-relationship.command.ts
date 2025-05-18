/**
 * Create Relationship Command
 *
 * Command to create a new relationship between users.
 */
export class CreateRelationshipCommand {
  constructor(
    public readonly userId: string,
    public readonly targetId: string,
    public readonly type: string,
  ) {}
}
