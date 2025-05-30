import { UserProfileUpdatedKafkaHandler } from './user-profile-updated.handler';
import { UserDeletedKafkaHandler } from './user-deleted.handler';

export const UserEventHandlers = [
  UserProfileUpdatedKafkaHandler,
  UserDeletedKafkaHandler,
];

export * from './user-profile-updated.handler';
export * from './user-deleted.handler';
