CREATE SCHEMA "users";
--> statement-breakpoint
CREATE TYPE "users"."relationship_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "users"."relationship_type" AS ENUM('FRIEND', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "users"."user_status" AS ENUM('ONLINE', 'OFFLINE', 'AWAY', 'DO_NOT_DISTURB');--> statement-breakpoint
CREATE TABLE "users"."profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"bio" text,
	"avatar_url" varchar(255),
	"status" "users"."user_status" DEFAULT 'OFFLINE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "users"."relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"related_user_id" uuid NOT NULL,
	"type" "users"."relationship_type" NOT NULL,
	"status" "users"."relationship_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" varchar(50) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."relationships" ADD CONSTRAINT "relationships_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."relationships" ADD CONSTRAINT "relationships_related_user_id_profiles_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "users"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."settings" ADD CONSTRAINT "settings_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."profiles"("id") ON DELETE cascade ON UPDATE no action;