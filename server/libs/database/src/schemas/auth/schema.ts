import { pgSchema } from 'drizzle-orm/pg-core';

/**
 * Auth Schema
 *
 * Define the PostgreSQL schema for the Auth Service.
 * This schema contains all authentication-related tables.
 */
export const authSchema = pgSchema('auth');
