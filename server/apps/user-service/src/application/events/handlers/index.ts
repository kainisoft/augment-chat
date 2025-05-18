import { UserCreatedHandler } from './user-created.handler';
import { UserDeletedHandler } from './user-deleted.handler';
import { UserProfileUpdatedHandler } from './user-profile-updated.handler';
import { UserStatusChangedHandler } from './user-status-changed.handler';

export const EventHandlers = [
  UserCreatedHandler,
  UserDeletedHandler,
  UserProfileUpdatedHandler,
  UserStatusChangedHandler,
];

export * from './user-created.handler';
export * from './user-deleted.handler';
export * from './user-profile-updated.handler';
export * from './user-status-changed.handler';
