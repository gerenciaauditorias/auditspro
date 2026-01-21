-- Create super admin user for multi-tenant management
-- Email: sysadmin@auditoriasenlinea.com.ar
-- Password: syst2m1dm3n

-- First, create a special tenant for system administration
INSERT INTO tenants (id, "companyName", subdomain, "planType", status, "onboardingCompleted")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'System Administration',
    'system',
    'enterprise',
    'active',
    true
)
ON CONFLICT (subdomain) DO UPDATE SET
    "companyName" = EXCLUDED."companyName",
    status = 'active';

-- Create super admin user with bcrypt hashed password
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
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'sysadmin@auditoriasenlinea.com.ar',
    '$2b$10$XvRvdtoxh4K1fFDxeXKET.aErY90xrIhRr8QPJxwLT9k9.AY5XUSa',
    'System Administrator',
    'super_admin',
    true,
    true
)
ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    role = 'super_admin',
    "isActive" = true,
    "emailVerified" = true;

-- Verify creation
SELECT id, email, "fullName", role, "isActive" 
FROM users 
WHERE email = 'sysadmin@auditoriasenlinea.com.ar';
