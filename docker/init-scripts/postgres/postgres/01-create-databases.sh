#!/bin/bash
set -e

# Create auth_db and user_db databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE user_db;
    
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE user_db TO postgres;
EOSQL

# Connect to auth_db and create initial schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "auth_db" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS auth;
    
    -- Create users table
    CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create refresh_tokens table
    CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        revoked BOOLEAN NOT NULL DEFAULT FALSE,
        revoked_at TIMESTAMP,
        UNIQUE(token)
    );
EOSQL

# Connect to user_db and create initial schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "user_db" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS users;
    
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS users.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_id UUID NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100),
        bio TEXT,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create relationships table
    CREATE TABLE IF NOT EXISTS users.relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users.profiles(id) ON DELETE CASCADE,
        related_user_id UUID NOT NULL REFERENCES users.profiles(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, related_user_id)
    );
    
    -- Create settings table
    CREATE TABLE IF NOT EXISTS users.settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users.profiles(id) ON DELETE CASCADE,
        key VARCHAR(50) NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, key)
    );
EOSQL

echo "PostgreSQL initialization completed"
