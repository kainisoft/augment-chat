import { CreateUserHandler } from './create-user.handler';
import { UpdateUserProfileHandler } from './update-user-profile.handler';
import { UpdateUserStatusHandler } from './update-user-status.handler';

export const CommandHandlers = [
  CreateUserHandler,
  UpdateUserProfileHandler,
  UpdateUserStatusHandler,
];

export * from './create-user.handler';
export * from './update-user-profile.handler';
export * from './update-user-status.handler';
