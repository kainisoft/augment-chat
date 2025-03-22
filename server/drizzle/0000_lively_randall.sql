CREATE SCHEMA "chat";
--> statement-breakpoint
CREATE TYPE "chat"."message_type" AS ENUM('text', 'image', 'file');--> statement-breakpoint
CREATE TYPE "chat"."user_status" AS ENUM('online', 'offline', 'away');--> statement-breakpoint
CREATE TABLE "chat"."chat_members" (
	"chat_id" uuid,
	"user_id" uuid,
	"role" text DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"last_read" timestamp,
	CONSTRAINT "chat_members_chat_id_user_id_pk" PRIMARY KEY("chat_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chat"."chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"is_group" boolean DEFAULT false,
	"last_message_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "chat"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid,
	"user_id" uuid,
	"type" "chat"."message_type" DEFAULT 'text',
	"content" text NOT NULL,
	"metadata" jsonb,
	"read_by" uuid[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"status" "chat"."user_status" DEFAULT 'offline',
	"last_seen" timestamp DEFAULT now(),
	"avatar_url" text,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "chat"."chat_members" ADD CONSTRAINT "chat_members_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "chat"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat"."chat_members" ADD CONSTRAINT "chat_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "chat"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat"."chats" ADD CONSTRAINT "chats_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "chat"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat"."messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "chat"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat"."messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "chat"."users"("id") ON DELETE no action ON UPDATE no action;