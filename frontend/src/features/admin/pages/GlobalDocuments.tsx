import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { FileText, Loader2 } from 'lucide-react';

export const GlobalDocuments: React.FC = () => {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await apiClient.get('/admin/documents');
                if (response.data.status === 'success') {
                    setDocs(response.data.data.documents);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    if (loading) return <Loader2 className="animate-spin m-auto" />;

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Documentos Globales</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organización</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {docs.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">{doc.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{doc.tenant?.companyName}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{doc.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
