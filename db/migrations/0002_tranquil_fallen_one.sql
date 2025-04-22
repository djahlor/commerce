ALTER TYPE "public"."purchase_status" ADD VALUE 'pending_scrape' BEFORE 'completed';--> statement-breakpoint
ALTER TYPE "public"."purchase_status" ADD VALUE 'scrape_complete' BEFORE 'completed';--> statement-breakpoint
ALTER TYPE "public"."purchase_status" ADD VALUE 'scrape_failed' BEFORE 'failed';--> statement-breakpoint
ALTER TYPE "public"."purchase_status" ADD VALUE 'generation_failed' BEFORE 'failed';--> statement-breakpoint
CREATE TABLE "scraped_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"url" text NOT NULL,
	"scraped_content" jsonb,
	"content_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scraped_data_purchase_id_unique" UNIQUE("purchase_id")
);
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_clerk_user_id_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "clerk_user_id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "scraped_data" ADD CONSTRAINT "scraped_data_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_clerk_user_id_profiles_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."profiles"("clerk_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "membership";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_email_unique" UNIQUE("email");--> statement-breakpoint
DROP TYPE "public"."membership";