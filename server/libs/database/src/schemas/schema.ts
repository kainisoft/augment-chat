import { pgSchema } from 'drizzle-orm/pg-core';

/**
 * Chat App Schema
 *
 * Define a single PostgreSQL schema for all tables.
 */
export const chatAppSchema = pgSchema('chat_app');
