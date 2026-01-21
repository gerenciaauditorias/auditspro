import { useAuth } from '../features/auth/hooks/useAuth';

export const usePermissions = () => {
    const { user } = useAuth();

    const isSuperAdmin = user?.role === 'super_admin';
    const isTenantAdmin = user?.role === 'tenant_admin';
    const isAdmin = isSuperAdmin || isTenantAdmin;

    return {
        isSuperAdmin,
        isTenantAdmin,
        isAdmin,
        canManageUsers: isAdmin,
        canManageAudits: isAdmin,
        canManageNCs: isAdmin,
        canManageKPIs: isAdmin,
        canManageDocuments: isAdmin,
        canManageRisks: isAdmin,
        canManageOrganization: isAdmin,
        canDeleteResources: isSuperAdmin, // Only super admin can hard delete
        canViewAllTenants: isSuperAdmin
    };
};
