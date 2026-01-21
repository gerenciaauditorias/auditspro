import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    ClipboardCheck,
    Calendar,
    User,
    ArrowRight,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    LayoutGrid,
    List
} from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { AuditModal } from '../features/audits/components/AuditModal';
import { generateAuditReport } from '../utils/pdfGenerator';

interface Audit {
    id: string;
    title: string;
    type: 'internal' | 'external' | 'supplier';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    plannedDate: string;
    scope: string;
}

const Audits: React.FC = () => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const response = await apiClient.get('/audits');
            if (response.data.status === 'success') {
                setAudits(response.data.data.audits);
            }
        } catch (error) {
            toast.error('Error al cargar auditorías');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            scheduled: 'Programada',
            in_progress: 'En Curso',
            completed: 'Finalizada',
            cancelled: 'Cancelada'
        };
        return labels[status] || status;
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Auditorías Internas</h2>
                        <p className="text-gray-500 mt-1">Programa, ejecuta y realiza seguimiento a tus auditorías de calidad.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary-600' : 'text-gray-400'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary-600' : 'text-gray-400'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                        <AuditModal onSuccess={fetchAudits} />
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <Clock size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">3</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Próximas Auditorías</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <ClipboardCheck size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">1</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">En Ejecución</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <CheckCircle2 size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">12</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Completadas este año</p>
                    </div>
                </div>

                {/* Audits Content */}
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Cargando auditorías...</div>
                ) : audits.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {audits.map((audit) => (
                                <div key={audit.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(audit.status)}`}>
                                                {getStatusLabel(audit.status)}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/audits/${audit.id}`)}
                                                className="text-gray-400 hover:text-gray-600 uppercase text-xs font-bold tracking-wider"
                                            >
                                                Detalles
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{audit.title}</h3>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar size={16} className="mr-2" />
                                                {new Date(audit.plannedDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User size={16} className="mr-2" />
                                                Auditor: Juan Pérez
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/audits/${audit.id}`)}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 text-primary-700 font-bold rounded-lg hover:bg-primary-50 transition-colors border border-primary-100"
                                        >
                                            {audit.status === 'scheduled' ? 'Gestionar / Reporte' : 'Ver Informe'}
                                            <ArrowRight size={16} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Planificada</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {audits.map((audit) => (
                                        <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{audit.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(audit.plannedDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(audit.status)}`}>
                                                    {getStatusLabel(audit.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/audits/${audit.id}`)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    Gestionar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    <div className="bg-white p-12 text-center rounded-xl border-2 border-dashed border-gray-200">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Sin auditorías programadas</h3>
                        <p className="text-gray-500 mb-6">Comienza gestionando tu programa anual de auditorías.</p>
                        <AuditModal
                            onSuccess={fetchAudits}
                            trigger={
                                <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 font-bold">
                                    <Plus size={20} className="mr-2" />
                                    Programar Primera Auditoría
                                </button>
                            }
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Audits;
