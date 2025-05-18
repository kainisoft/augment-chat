/**
 * Search Users Query
 *
 * Query to search for users by username or display name
 */
export class SearchUsersQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
