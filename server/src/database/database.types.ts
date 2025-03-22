import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type DrizzleDatabase = NeonHttpDatabase<typeof schema>;
