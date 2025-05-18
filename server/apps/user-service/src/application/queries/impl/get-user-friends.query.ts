/**
 * Get User Friends Query
 *
 * Query to retrieve all friends for a user
 */
export class GetUserFriendsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
