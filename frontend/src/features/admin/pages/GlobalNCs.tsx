import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { AlertCircle, Loader2 } from 'lucide-react';

export const GlobalNCs: React.FC = () => {
    const [ncs, setNcs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNcs = async () => {
            try {
                const response = await apiClient.get('/admin/ncs');
                if (response.data.status === 'success') {
                    setNcs(response.data.data.ncs);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNcs();
    }, []);

    if (loading) return <Loader2 className="animate-spin m-auto" />;

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">No Conformidades Globales</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organización</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ncs.map((nc) => (
                            <tr key={nc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{nc.description}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{nc.tenant?.companyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${nc.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {nc.severity.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${nc.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {nc.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
