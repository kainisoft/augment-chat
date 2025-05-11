/**
 * Get User Auth Info Query
 *
 * Query to retrieve authentication information for a user
 */
export class GetUserAuthInfoQuery {
  constructor(public readonly userId: string) {}
}
