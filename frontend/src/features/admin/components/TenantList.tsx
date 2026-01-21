import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Building, Trash2, Edit, Loader2, Users, Plus, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { TenantForm } from './TenantForm';

interface Tenant {
    id: string;
    companyName: string;
    subdomain: string;
    planType: string;
    status: string;
    userCount: number;
    createdAt: string;
}

export const TenantList: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await apiClient.get('/admin/tenants');
            if (response.data.status === 'success') {
                setTenants(response.data.data.tenants);
            }
        } catch (error) {
            toast.error('Error al cargar organizaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (tenant: Tenant) => {
        if (!confirm(`¿Estás seguro de ELIMINAR PERMANENTEMENTE la organización "${tenant.companyName}" y todos sus datos? Esta acción no se puede deshacer.`)) return;

        try {
            await apiClient.delete(`/admin/tenants/${tenant.id}`);
            toast.success('Organización eliminada');
            fetchTenants();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar organización');
        }
    };

    const handleEdit = (tenant: Tenant) => {
        // Prepare tenant data for form (omitting sensitive/unneeded fields if necessary)
        setEditingTenant(tenant);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Organizaciones</h3>
                    <p className="text-sm text-gray-500 mt-1">Gestiona los tenants suscritos a la plataforma</p>
                </div>
                <button
                    onClick={() => { setEditingTenant(null); setShowForm(true); }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Nueva Organización
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subdominio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Building size={20} className="text-indigo-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{tenant.companyName}</div>
                                            <div className="text-xs text-gray-500">ID: {tenant.id.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.subdomain}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${tenant.planType === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                                            tenant.planType === 'professional' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {tenant.planType.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {tenant.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Users size={16} className="mr-1 text-gray-400" />
                                        {tenant.userCount || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {/* Edit Button - Placeholder for now or connect to form */}
                                        <button
                                            onClick={() => handleEdit(tenant)}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tenant)}
                                            disabled={tenant.subdomain === 'system'}
                                            className={`text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 ${tenant.subdomain === 'system' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <TenantForm
                    onClose={() => setShowForm(false)}
                    onSuccess={() => { setShowForm(false); fetchTenants(); }}
                    initialData={editingTenant}
                />
            )}
        </div>
    );
};
