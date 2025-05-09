import { pgSchema } from 'drizzle-orm/pg-core';

/**
 * Users Schema
 *
 * Define the PostgreSQL schema for the User Service.
 * This schema contains all user-related tables.
 */
export const usersSchema = pgSchema('users');
