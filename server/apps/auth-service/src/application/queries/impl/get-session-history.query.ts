/**
 * Get Session History Query
 *
 * Query to retrieve session history for a user
 */
export class GetSessionHistoryQuery {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
