import { Resolver, Subscription, Args, Context } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { LoggingService } from '@app/logging';

/**
 * User Presence Subscription Types
 */
export class UserPresenceType {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
  lastSeen?: Date;
  timestamp: Date;
}

export class UserActivityType {
  userId: string;
  activity: string;
  timestamp: Date;
}

export class FriendStatusType {
  userId: string;
  friendId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  timestamp: Date;
}

/**
 * User Presence Subscription Resolver
 *
 * Handles real-time user presence and activity subscriptions including:
 * - User online/offline status changes
 * - User activity updates
 * - Friend status changes
 *
 * Phase 3: WebSocket Gateway Implementation - User Service Integration
 */
@Resolver()
export class UserPresenceResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext('UserPresenceResolver');
  }

  /**
   * Subscribe to user presence changes
   */
  @Subscription(() => UserPresenceType, {
    filter: (payload, variables, context) => {
      // Check if user is authenticated
      if (!context?.user?.id) {
        return false;
      }

      // If specific userId is provided, filter for that user
      if (variables.userId) {
        return payload.userId === variables.userId;
      }

      // For development, allow all presence updates for authenticated users
      // In production, this should check friend/contact relationships
      return payload.userId !== context.user.id; // Don't send own presence updates
    },
    resolve: (payload) => {
      return payload.presence;
    },
  })
  userPresenceChanged(
    @Args('userId', { nullable: true }) userId?: string,
    @Context() context?: any,
  ) {
    const subscriptionKey = userId ? `presence.${userId}` : 'presence.*';

    this.loggingService.log(
      `User ${context?.user?.id} subscribed to presence changes: ${subscriptionKey}`,
      'PresenceSubscription',
    );

    return this.pubSub.asyncIterator(subscriptionKey);
  }

  /**
   * Subscribe to user activity changes
   */
  @Subscription(() => UserActivityType, {
    filter: (payload, variables, context) => {
      // Check if user is authenticated
      if (!context?.user?.id) {
        return false;
      }

      // If specific userId is provided, filter for that user
      if (variables.userId) {
        return payload.userId === variables.userId;
      }

      // For development, allow all activity updates for authenticated users
      // In production, this should check friend/contact relationships
      return payload.userId !== context.user.id; // Don't send own activity updates
    },
    resolve: (payload) => {
      return payload.activity;
    },
  })
  userActivityChanged(
    @Args('userId', { nullable: true }) userId?: string,
    @Context() context?: any,
  ) {
    const subscriptionKey = userId ? `activity.${userId}` : 'activity.*';

    this.loggingService.log(
      `User ${context?.user?.id} subscribed to activity changes: ${subscriptionKey}`,
      'ActivitySubscription',
    );

    return this.pubSub.asyncIterator(subscriptionKey);
  }

  /**
   * Subscribe to friend status changes
   */
  @Subscription(() => FriendStatusType, {
    filter: (payload, _variables, context) => {
      // Only send friend status updates that involve the current user
      if (!context?.user?.id) {
        return false;
      }

      return (
        payload.userId === context.user.id ||
        payload.friendId === context.user.id
      );
    },
    resolve: (payload) => {
      return payload.friendStatus;
    },
  })
  friendStatusChanged(@Context() context: any) {
    this.loggingService.log(
      `User ${context.user?.id} subscribed to friend status changes`,
      'FriendStatusSubscription',
    );

    return this.pubSub.asyncIterator(`friendStatus.${context.user?.id}`);
  }

  /**
   * Subscribe to all presence updates for the current user's contacts
   */
  @Subscription(() => UserPresenceType, {
    filter: (payload, _variables, context) => {
      // Only send presence updates for the user's friends/contacts
      if (!context?.user?.id) {
        return false;
      }

      // For development, allow all presence updates for authenticated users
      // In production, this should check friend/contact relationships
      return payload.userId !== context.user.id; // Don't send own presence updates
    },
    resolve: (payload) => {
      return payload.presence;
    },
  })
  contactsPresenceUpdates(@Context() context: any) {
    this.loggingService.log(
      `User ${context.user?.id} subscribed to contacts presence updates`,
      'ContactsPresenceSubscription',
    );

    return this.pubSub.asyncIterator(`contacts.${context.user?.id}.presence`);
  }

  /**
   * Check if a user is a friend or contact
   * TODO: Implement proper friend/contact checking with User Service
   */
  private isFriendOrContact(currentUser: any, targetUserId: string): boolean {
    // For development, allow all users to see each other's presence
    // In production, this should check with the User Service
    if (!currentUser?.id || !targetUserId) {
      return false;
    }

    // Don't send presence updates to the user about themselves
    if (currentUser.id === targetUserId) {
      return false;
    }

    this.loggingService.debug(
      `Checking friend/contact relationship between ${currentUser.id} and ${targetUserId}`,
      'FriendCheck',
    );

    // TODO: Implement actual friend/contact check with User Service
    // For now, allow all users to see each other's presence for development
    return true;
  }

  /**
   * Utility method to publish presence updates
   * This would typically be called by the User Service when presence changes
   */
  async publishPresenceUpdate(presence: UserPresenceType): Promise<void> {
    try {
      // Publish to specific user channel
      await this.pubSub.publish(`presence.${presence.userId}`, {
        presence,
        userId: presence.userId,
      });

      // Publish to general presence channel
      await this.pubSub.publish('presence.*', {
        presence,
        userId: presence.userId,
      });

      this.loggingService.log(
        `Published presence update for user ${presence.userId}: ${presence.status}`,
        'PresencePublish',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to publish presence update for user ${presence.userId}`,
        error.stack,
        'PresencePublishError',
      );
    }
  }

  /**
   * Utility method to publish activity updates
   */
  async publishActivityUpdate(activity: UserActivityType): Promise<void> {
    try {
      // Publish to specific user channel
      await this.pubSub.publish(`activity.${activity.userId}`, {
        activity,
        userId: activity.userId,
      });

      // Publish to general activity channel
      await this.pubSub.publish('activity.*', {
        activity,
        userId: activity.userId,
      });

      this.loggingService.log(
        `Published activity update for user ${activity.userId}: ${activity.activity}`,
        'ActivityPublish',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to publish activity update for user ${activity.userId}`,
        error.stack,
        'ActivityPublishError',
      );
    }
  }

  /**
   * Utility method to publish friend status updates
   */
  async publishFriendStatusUpdate(
    friendStatus: FriendStatusType,
  ): Promise<void> {
    try {
      // Publish to both users involved in the friend relationship
      await this.pubSub.publish(`friendStatus.${friendStatus.userId}`, {
        friendStatus,
        userId: friendStatus.userId,
        friendId: friendStatus.friendId,
      });

      await this.pubSub.publish(`friendStatus.${friendStatus.friendId}`, {
        friendStatus,
        userId: friendStatus.userId,
        friendId: friendStatus.friendId,
      });

      this.loggingService.log(
        `Published friend status update between ${friendStatus.userId} and ${friendStatus.friendId}: ${friendStatus.status}`,
        'FriendStatusPublish',
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to publish friend status update between ${friendStatus.userId} and ${friendStatus.friendId}`,
        error.stack,
        'FriendStatusPublishError',
      );
    }
  }
}
