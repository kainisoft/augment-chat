/**
 * Get User Relationships Query
 *
 * Query to retrieve all relationships for a user
 */
export class GetUserRelationshipsQuery {
  constructor(
    public readonly userId: string,
    public readonly type?: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
