/**
 * Validate Token Query
 *
 * Query to validate a token and return its payload
 */
export class ValidateTokenQuery {
  constructor(
    public readonly token: string,
    public readonly tokenType: string,
  ) {}
}
