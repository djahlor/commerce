-- Create the scraped_data table for storing data extracted from customer websites
CREATE TABLE IF NOT EXISTS "scraped_data" (
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

-- Add foreign key constraint for purchase_id referencing purchases(id)
ALTER TABLE "scraped_data" ADD CONSTRAINT "scraped_data_purchase_id_purchases_id_fk" 
    FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE cascade ON UPDATE no action; 