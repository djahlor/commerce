ALTER TYPE "public"."purchase_status_v2" RENAME TO "purchase_status";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DEFAULT 'processing'::text;--> statement-breakpoint
DROP TYPE "public"."purchase_status";--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('processing', 'pending_scrape', 'scrape_complete', 'completed', 'scrape_failed', 'generation_failed', 'failed');--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DEFAULT 'processing'::"public"."purchase_status";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DATA TYPE "public"."purchase_status" USING "status"::"public"."purchase_status";