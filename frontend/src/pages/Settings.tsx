import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Building, Users, Shield, Loader2, Globe } from 'lucide-react';
import { OrganizationSettings } from '../features/settings/components/OrganizationSettings';
import { UserManagement } from '../features/settings/components/UserManagement';
import { AdminPanel } from '../features/admin/components/AdminPanel';
import { useAuth } from '../features/auth/hooks/useAuth';

import { usePermissions } from '../hooks/usePermissions';

type TabType = 'organization' | 'users' | 'security' | 'admin';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('organization');
    const { isAdmin, isTenantAdmin, isSuperAdmin } = usePermissions();

    if (!isAdmin) {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                        <Shield className="mx-auto text-red-500 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-red-900 mb-2">Acceso Denegado</h2>
                        <p className="text-red-700">Solo los administradores pueden acceder a la configuración.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const tabs = [
        { id: 'organization' as TabType, label: 'Organización', icon: Building, hidden: !isTenantAdmin },
        { id: 'users' as TabType, label: 'Usuarios', icon: Users, hidden: !isTenantAdmin },
        { id: 'security' as TabType, label: 'Seguridad', icon: Shield, hidden: !isTenantAdmin },
        { id: 'admin' as TabType, label: 'Administración', icon: Globe, hidden: !isSuperAdmin }
    ];

    const visibleTabs = tabs.filter(t => !t.hidden);

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración</h2>
                <p className="text-gray-500 mb-6">Gestiona tu organización y usuarios</p>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Icon size={18} className="mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'organization' && <OrganizationSettings />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'admin' && <AdminPanel />}
                    {activeTab === 'security' && (
                        <div className="bg-white p-8 border border-gray-200 rounded-xl text-center text-gray-400">
                            Configuración de seguridad en desarrollo...
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
