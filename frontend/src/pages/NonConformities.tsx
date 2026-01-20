import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    AlertTriangle,
    Search,
    Plus,
    Filter,
    ChevronRight,
    MessageSquare,
    Calendar,
    User,
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { NCModal } from '../features/ncs/components/NCModal';

interface NonConformity {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'analysis' | 'action_plan' | 'verification' | 'closed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string;
    dueDate: string;
}

const NonConformities: React.FC = () => {
    const [ncs, setNcs] = useState<NonConformity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNCs();
    }, []);

    const fetchNCs = async () => {
        try {
            const response = await apiClient.get('/ncs');
            if (response.data.status === 'success') {
                setNcs(response.data.data.ncs);
            }
        } catch (error) {
            toast.error('Error al cargar no conformidades');
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">No Conformidades y Mejora</h2>
                        <p className="text-gray-500 mt-1">Gestiona hallazgos, realiza análisis de causa raíz y define planes de acción.</p>
                    </div>
                    <NCModal onSuccess={fetchNCs} />
                </div>

                {/* Grid of NCs */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-400">Cargando...</div>
                    ) : ncs.length > 0 ? (
                        ncs.map((nc) => (
                            <div key={nc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                <div className="p-5 flex items-center">
                                    <div className={`p-3 rounded-lg mr-5 ${getSeverityStyle(nc.severity)}`}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center mb-1">
                                            <h3 className="text-lg font-bold text-gray-900 truncate mr-3">{nc.title}</h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                                {nc.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                                            <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(nc.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center"><User size={14} className="mr-1" /> Pendiente Asignación</span>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center space-x-2 mr-8">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-bold text-primary-700">M</div>
                                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-700">A</div>
                                        </div>
                                        <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-400">
                                            <MessageSquare size={14} className="inline mr-1" /> 0
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-primary-500 transition-colors" size={24} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-16 text-center rounded-2xl border border-gray-200 shadow-inner">
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Todo bajo control!</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">No hay no conformidades abiertas en este momento. Tu sistema de gestión está operando correctamente.</p>
                            <button className="text-primary-600 font-bold hover:underline">Ver historial de NCs cerradas</button>
                        </div>
                    )}
                </div>

                {/* Sidebar / Quick Tips */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold mb-4 flex items-center">
                                <ShieldAlert className="mr-2 text-yellow-400" />
                                Tip de Calidad
                            </h4>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                El análisis de causa raíz es fundamental. No limites tu plan de acción a corregir el síntoma; utiliza la técnica de los "5 Por Qués" para llegar a la raíz del problema.
                            </p>
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
                                Aprender más sobre RCA
                            </button>
                        </div>
                        <AlertTriangle className="absolute -right-8 -bottom-8 text-white/5 w-48 h-48" />
                    </div>
                    <div className="bg-primary-600 rounded-2xl p-8 text-white shadow-xl shadow-primary-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold mb-4">Métricas del Mes</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-xl p-4">
                                    <span className="block text-3xl font-black mb-1">0</span>
                                    <span className="text-xs text-primary-100 uppercase font-bold tracking-wider">NCs Críticas</span>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <span className="block text-3xl font-black mb-1">100%</span>
                                    <span className="text-xs text-primary-100 uppercase font-bold tracking-wider">Tasa de Cierre</span>
                                </div>
                            </div>
                        </div>
                        <CheckCircle2 className="absolute -right-8 -bottom-8 text-white/5 w-48 h-48" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NonConformities;
