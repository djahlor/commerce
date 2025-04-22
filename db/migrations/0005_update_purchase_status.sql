-- Add new enum values to purchase_status
-- Note: ALTER TYPE ... ADD VALUE is non-transactional in Postgres
DO $$ BEGIN
    ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'pending_scrape';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'scrape_complete';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'scrape_failed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'generation_failed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 