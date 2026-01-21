-- Create super admin user for multi-tenant management
-- Email: sysadmin@auditoriasenlinea.com.ar
-- Password: syst2m1dm3n (will be hashed)

-- First, create a special tenant for system administration (if not exists)
INSERT INTO tenants (id, "companyName", subdomain, "planType", status, "onboardingCompleted")
VALUES (
    'system-tenant-00000000-0000-0000-0000-000000000000',
    'System Administration',
    'system',
    'enterprise',
    'active',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Create super admin user
-- Password hash for 'syst2m1dm3n' using bcrypt (10 rounds)
-- You'll need to generate this hash using bcrypt
-- For now, this is a placeholder - the actual hash should be generated
INSERT INTO users (
    id,
    "tenantId",
    email,
    "passwordHash",
    "fullName",
    role,
    "isActive",
    "emailVerified"
)
VALUES (
    'superadmin-0000-0000-0000-000000000001',
    'system-tenant-00000000-0000-0000-0000-000000000000',
    'sysadmin@auditoriasenlinea.com.ar',
    '$2b$10$YourHashHere', -- This needs to be replaced with actual bcrypt hash
    'System Administrator',
    'super_admin',
    true,
    true
)
ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    role = 'super_admin',
    "isActive" = true;

-- Note: To generate the password hash, run this in Node.js:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('syst2m1dm3n', 10).then(hash => console.log(hash));
