import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { CreditCard, Calendar, AlertCircle, Loader2 } from 'lucide-react';

export const SubscriptionPanel: React.FC = () => {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await apiClient.get('/admin/tenants');
                if (response.data.status === 'success') {
                    setTenants(response.data.data.tenants);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    if (loading) return <Loader2 className="animate-spin m-auto" />;

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Suscripciones y Facturación</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 font-medium">Ingresos Mensuales Est.</p>
                            <h4 className="text-3xl font-bold mt-2">$24,500</h4>
                        </div>
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                    </div>
                </div>
                {/* More KPI cards */}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-800">Estado de Suscripciones</h4>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organización</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima Factura</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{tenant.companyName}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{tenant.planType}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {tenant.status === 'active' ? 'Activo' : 'Vencido'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {/* Mock date */}
                                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">Gestionar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
