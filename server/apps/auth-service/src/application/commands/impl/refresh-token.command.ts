/**
 * Refresh Token Command
 *
 * Command to refresh an access token using a refresh token
 */
export class RefreshTokenCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
  ) {}
}
