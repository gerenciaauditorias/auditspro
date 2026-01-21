-- Migration: Update audit_checklists table for enhanced status system
-- Add new status column
ALTER TABLE audit_checklists 
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Migrate existing data: isCompliant true -> 'compliant', false -> 'non_compliant', null -> null
UPDATE audit_checklists 
SET status = CASE 
    WHEN "isCompliant" = true THEN 'compliant'
    WHEN "isCompliant" = false THEN 'non_compliant'
    ELSE NULL
END
WHERE status IS NULL;

-- Add evidence column
ALTER TABLE audit_checklists 
ADD COLUMN IF NOT EXISTS evidence JSONB;

-- Optional: Drop old isCompliant column (commented out for safety)
-- ALTER TABLE audit_checklists DROP COLUMN IF EXISTS "isCompliant";
