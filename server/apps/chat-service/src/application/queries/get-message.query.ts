/**
 * Get Message Query
 *
 * Query for retrieving a message by ID.
 */
export class GetMessageQuery {
  constructor(
    public readonly messageId: string,
    public readonly userId: string, // For authorization
  ) {}
}
