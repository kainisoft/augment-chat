import { UserRegisteredHandler } from './user-registered.handler';
import { UserLoggedInHandler } from './user-logged-in.handler';
import { UserLoggedOutHandler } from './user-logged-out.handler';
import { PasswordResetRequestedHandler } from './password-reset-requested.handler';
import { PasswordChangedHandler } from './password-changed.handler';

export const EventHandlers = [
  UserRegisteredHandler,
  UserLoggedInHandler,
  UserLoggedOutHandler,
  PasswordResetRequestedHandler,
  PasswordChangedHandler,
];

export * from './user-registered.handler';
export * from './user-logged-in.handler';
export * from './user-logged-out.handler';
export * from './password-reset-requested.handler';
export * from './password-changed.handler';
