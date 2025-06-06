/**
 * Get Conversation Query
 *
 * Query for retrieving a conversation by ID.
 */
export class GetConversationQuery {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string, // For authorization
  ) {}
}
