-- Drop the existing foreign key constraint that references the old profiles structure
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_clerk_user_id_profiles_user_id_fk";

-- Update the profiles table structure
DROP TABLE "profiles";

CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);

-- Add new foreign key constraint with set null on delete
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_clerk_user_id_profiles_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;

-- Create the temp_carts table for Polar metadata workaround
CREATE TABLE "temp_carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"temp_cart_id" text NOT NULL,
	"url" text,
	"cart_data" jsonb NOT NULL,
	"processed" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "temp_carts_temp_cart_id_unique" UNIQUE("temp_cart_id")
); 