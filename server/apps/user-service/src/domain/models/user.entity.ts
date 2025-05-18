import { UserId } from '@app/domain';
import {
  Username,
  DisplayName,
  Bio,
  AvatarUrl,
  UserStatus,
  UserStatusEnum,
  AuthId,
} from './value-objects';
import { EntityStateError } from '@app/common/errors/domain/business-error';

/**
 * User Entity Props
 *
 * Properties required to create a User entity.
 */
export interface UserProps {
  id?: UserId;
  authId: AuthId;
  username: Username;
  displayName: DisplayName;
  bio?: Bio;
  avatarUrl?: AvatarUrl;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Entity
 *
 * Represents a user in the system.
 */
export class User {
  private readonly id: UserId;
  private readonly authId: AuthId;
  private username: Username;
  private displayName: DisplayName;
  private bio: Bio;
  private avatarUrl: AvatarUrl;
  private status: UserStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  /**
   * Create a new User entity
   * @param props - The user properties
   */
  constructor(props: UserProps) {
    this.id = props.id || new UserId();
    this.authId = props.authId;
    this.username = props.username;
    this.displayName = props.displayName;
    this.bio = props.bio || new Bio();
    this.avatarUrl = props.avatarUrl || new AvatarUrl();
    this.status = props.status || new UserStatus(UserStatusEnum.OFFLINE);
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Get the user ID
   * @returns The user ID
   */
  getId(): UserId {
    return this.id;
  }

  /**
   * Get the authentication ID
   * @returns The authentication ID
   */
  getAuthId(): AuthId {
    return this.authId;
  }

  /**
   * Get the username
   * @returns The username
   */
  getUsername(): Username {
    return this.username;
  }

  /**
   * Update the username
   * @param username - The new username
   */
  updateUsername(username: Username): void {
    this.username = username;
    this.updatedAt = new Date();
  }

  /**
   * Get the display name
   * @returns The display name
   */
  getDisplayName(): DisplayName {
    return this.displayName;
  }

  /**
   * Update the display name
   * @param displayName - The new display name
   */
  updateDisplayName(displayName: DisplayName): void {
    this.displayName = displayName;
    this.updatedAt = new Date();
  }

  /**
   * Get the bio
   * @returns The bio
   */
  getBio(): Bio {
    return this.bio;
  }

  /**
   * Update the bio
   * @param bio - The new bio
   */
  updateBio(bio: Bio): void {
    this.bio = bio;
    this.updatedAt = new Date();
  }

  /**
   * Get the avatar URL
   * @returns The avatar URL
   */
  getAvatarUrl(): AvatarUrl {
    return this.avatarUrl;
  }

  /**
   * Update the avatar URL
   * @param avatarUrl - The new avatar URL
   */
  updateAvatarUrl(avatarUrl: AvatarUrl): void {
    this.avatarUrl = avatarUrl;
    this.updatedAt = new Date();
  }

  /**
   * Get the user status
   * @returns The user status
   */
  getStatus(): UserStatus {
    return this.status;
  }

  /**
   * Update the user status
   * @param status - The new user status
   */
  updateStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Set the user as online
   */
  setOnline(): void {
    this.status = new UserStatus(UserStatusEnum.ONLINE);
    this.updatedAt = new Date();
  }

  /**
   * Set the user as offline
   */
  setOffline(): void {
    this.status = new UserStatus(UserStatusEnum.OFFLINE);
    this.updatedAt = new Date();
  }

  /**
   * Set the user as away
   */
  setAway(): void {
    this.status = new UserStatus(UserStatusEnum.AWAY);
    this.updatedAt = new Date();
  }

  /**
   * Set the user as do not disturb
   */
  setDoNotDisturb(): void {
    this.status = new UserStatus(UserStatusEnum.DO_NOT_DISTURB);
    this.updatedAt = new Date();
  }

  /**
   * Get the creation date
   * @returns The creation date
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Get the last update date
   * @returns The last update date
   */
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Update the user profile
   * @param props - The profile properties to update
   */
  updateProfile(props: {
    displayName?: DisplayName;
    bio?: Bio;
    avatarUrl?: AvatarUrl;
  }): void {
    if (props.displayName) {
      this.displayName = props.displayName;
    }

    if (props.bio) {
      this.bio = props.bio;
    }

    if (props.avatarUrl) {
      this.avatarUrl = props.avatarUrl;
    }

    this.updatedAt = new Date();
  }
}
