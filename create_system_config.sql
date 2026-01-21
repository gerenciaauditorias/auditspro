-- Create system_configs table
CREATE TABLE IF NOT EXISTS "system_configs" (
    "key" VARCHAR PRIMARY KEY,
    "value" TEXT NOT NULL,
    "category" VARCHAR NOT NULL DEFAULT 'general',
    "description" VARCHAR,
    "isSecret" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Insert default SMTP placeholders (to be configured by admin)
INSERT INTO "system_configs" ("key", "value", "category", "description", "isSecret")
VALUES 
    ('smtp_host', '', 'smtp', 'SMTP Server Host', false),
    ('smtp_port', '587', 'smtp', 'SMTP Server Port', false),
    ('smtp_user', '', 'smtp', 'SMTP Username', true),
    ('smtp_pass', '', 'smtp', 'SMTP Password', true),
    ('smtp_secure', 'false', 'smtp', 'Use SSL/TLS', false),
    ('smtp_from', 'noreply@auditoriasenlinea.com.ar', 'smtp', 'Default From Address', false)
ON CONFLICT ("key") DO NOTHING;
