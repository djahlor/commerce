-- Add new enum value for processing_missing_url
DO $$ BEGIN
    ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'processing_missing_url';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 