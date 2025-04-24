DO $$
BEGIN
    -- Check if the enum value already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'purchase_status'
        AND e.enumlabel = 'processing_missing_url'
    ) THEN
        -- Add the new enum value safely
        ALTER TYPE "purchase_status" ADD VALUE IF NOT EXISTS 'processing_missing_url';
    END IF;
END
$$; 