import { UserLoggedInKafkaHandler } from './user-logged-in.handler';
import { UserLoggedOutKafkaHandler } from './user-logged-out.handler';
import { PasswordChangedKafkaHandler } from './password-changed.handler';
import { SessionTerminatedKafkaHandler } from './session-terminated.handler';

export const AuthEventHandlers = [
  UserLoggedInKafkaHandler,
  UserLoggedOutKafkaHandler,
  PasswordChangedKafkaHandler,
  SessionTerminatedKafkaHandler,
];

export * from './user-logged-in.handler';
export * from './user-logged-out.handler';
export * from './password-changed.handler';
export * from './session-terminated.handler';
