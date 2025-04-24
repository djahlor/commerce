ALTER TABLE "temp_carts" DROP CONSTRAINT "temp_carts_temp_cart_id_unique";--> statement-breakpoint
ALTER TABLE "temp_carts" ADD COLUMN "cart_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "temp_carts" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "temp_carts" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "temp_carts" DROP COLUMN "temp_cart_id";--> statement-breakpoint
ALTER TABLE "temp_carts" DROP COLUMN "cart_data";--> statement-breakpoint
ALTER TABLE "temp_carts" DROP COLUMN "processed";--> statement-breakpoint
ALTER TABLE "temp_carts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "temp_carts" ADD CONSTRAINT "temp_carts_cart_id_unique" UNIQUE("cart_id");