import { UserRegisteredKafkaHandler } from './user-registered.handler';
import { UserLoggedInKafkaHandler } from './user-logged-in.handler';
import { UserLoggedOutKafkaHandler } from './user-logged-out.handler';
import { PasswordChangedKafkaHandler } from './password-changed.handler';
import { SessionTerminatedKafkaHandler } from './session-terminated.handler';
import { AllSessionsTerminatedKafkaHandler } from './all-sessions-terminated.handler';

export const AuthEventHandlers = [
  UserRegisteredKafkaHandler,
  UserLoggedInKafkaHandler,
  UserLoggedOutKafkaHandler,
  PasswordChangedKafkaHandler,
  SessionTerminatedKafkaHandler,
  AllSessionsTerminatedKafkaHandler,
];

export * from './user-registered.handler';
export * from './user-logged-in.handler';
export * from './user-logged-out.handler';
export * from './password-changed.handler';
export * from './session-terminated.handler';
export * from './all-sessions-terminated.handler';
