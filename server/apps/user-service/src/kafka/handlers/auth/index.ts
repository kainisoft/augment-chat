import { UserRegisteredHandler } from './user-registered.handler';
import { UserDeletedHandler } from './user-deleted.handler';
import { UserEmailChangedHandler } from './user-email-changed.handler';

export const AuthEventHandlers = [
  UserRegisteredHandler,
  UserDeletedHandler,
  UserEmailChangedHandler,
];
