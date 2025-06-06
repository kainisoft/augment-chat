/**
 * Get Conversation Messages Query
 *
 * Query for retrieving messages from a conversation with pagination.
 */
export class GetConversationMessagesQuery {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string, // For authorization
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
