ALTER TABLE "profiles" RENAME COLUMN "clerk_user_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_clerk_user_id_profiles_clerk_user_id_fk";
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_clerk_user_id_profiles_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;