/**
 * Get User Presence Query
 *
 * Query for retrieving user presence status.
 */
export class GetUserPresenceQuery {
  constructor(
    public readonly userId: string,
    public readonly requestingUserId?: string, // For authorization if needed
  ) {}
}
