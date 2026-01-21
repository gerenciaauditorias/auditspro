import React from 'react';
import { TenantList } from './TenantList';
import { SMTPConfig } from './SMTPConfig';
import { Building, Globe, Server } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <Building size={24} />
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-500">Total Organizaciones</h4>
                            <p className="text-2xl font-semibold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                {/* Add more stats here if needed */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Tenant List */}
                <div className="lg:col-span-2">
                    <TenantList />
                </div>

                {/* Sidebar - System Config */}
                <div className="lg:col-span-1 space-y-6">
                    <SMTPConfig />

                    {/* Future: Other system configs */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-60">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Server size={20} className="mr-2 text-primary-600" />
                            Estado del Sistema
                        </h3>
                        <p className="text-sm text-gray-500">Métricas de sistema próximamente...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
