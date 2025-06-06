/**
 * Get User Conversations Query
 *
 * Query for retrieving conversations for a user with pagination.
 */
export class GetUserConversationsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
