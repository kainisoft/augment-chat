import { UserPresenceType } from '../../graphql/types';

/**
 * Update Presence Command
 *
 * Command for updating user presence status.
 */
export class UpdatePresenceCommand {
  constructor(
    public readonly userId: string,
    public readonly status: UserPresenceType,
    public readonly statusMessage?: string,
  ) {}
}
