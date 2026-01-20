import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    ShieldAlert,
    Plus,
    AlertTriangle,
    CheckCircle2,
    Info,
    ArrowRight,
    TrendingUp,
    Zap
} from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface Risk {
    id: string;
    description: string;
    probability: number;
    impact: number;
    status: string;
}

const Risks: React.FC = () => {
    const [risks, setRisks] = useState<Risk[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRisks();
    }, []);

    const fetchRisks = async () => {
        try {
            const response = await apiClient.get('/risks');
            if (response.data.status === 'success') {
                setRisks(response.data.data.risks);
            }
        } catch (error) {
            toast.error('Error al cargar matriz de riesgos');
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (prob: number, imp: number) => {
        const score = prob * imp;
        if (score >= 15) return 'bg-red-500 text-white';
        if (score >= 8) return 'bg-orange-500 text-white';
        if (score >= 4) return 'bg-yellow-400 text-gray-800';
        return 'bg-green-500 text-white';
    };

    const getHeatmapData = () => {
        const matrix = Array(5).fill(0).map(() => Array(5).fill([] as Risk[]));
        risks.forEach(risk => {
            if (risk.probability >= 1 && risk.probability <= 5 && risk.impact >= 1 && risk.impact <= 5) {
                matrix[5 - risk.probability][risk.impact - 1] = [...matrix[5 - risk.probability][risk.impact - 1], risk];
            }
        });
        return matrix;
    };

    const matrix = getHeatmapData();

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestión de Riesgos</h2>
                        <p className="text-gray-500 mt-1">Identifica, evalúa y mitiga los riesgos operativos de tu organización.</p>
                    </div>
                    <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100 font-bold">
                        <Plus size={20} className="mr-2" />
                        Identificar Riesgo
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Heatmap Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center">
                                <TrendingUp className="mr-2 text-primary-600" />
                                Matriz de Riesgos (Impacto vs Probabilidad)
                            </h3>

                            <div className="relative">
                                {/* Matrix Labels */}
                                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    Probabilidad
                                </div>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    Impacto
                                </div>

                                <div className="grid grid-cols-5 gap-2 aspect-square max-w-md mx-auto">
                                    {matrix.map((row, rIdx) => (
                                        row.map((cellRisks, cIdx) => (
                                            <div
                                                key={`${rIdx}-${cIdx}`}
                                                className={`rounded-lg border-2 border-white shadow-sm flex items-center justify-center relative group cursor-help ${getRiskColor(5 - rIdx, cIdx + 1)} transition-transform hover:scale-105`}
                                            >
                                                {cellRisks.length > 0 && (
                                                    <span className="text-sm font-black tabular-nums">
                                                        {cellRisks.length}
                                                    </span>
                                                )}
                                                {cellRisks.length > 0 && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-[10px] p-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                                                        <p className="font-bold mb-1 border-b border-white/20 pb-1">Riesgos en este nivel:</p>
                                                        {cellRisks.slice(0, 3).map((r: Risk, i: number) => (
                                                            <p key={i} className="truncate">• {r.description}</p>
                                                        ))}
                                                        {cellRisks.length > 3 && <p className="italic text-gray-400 mt-1">+ {cellRisks.length - 3} más</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats & Guide */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <Zap className="absolute -right-4 -top-4 w-32 h-32 text-white/10" />
                            <h4 className="text-xl font-bold mb-4 relative z-10">Estado Global</h4>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                    <span className="text-sm font-medium">Críticos</span>
                                    <span className="bg-red-500 px-3 py-1 rounded-full text-xs font-black">{risks.filter(r => r.probability * r.impact >= 15).length}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                                    <span className="text-sm font-medium">Bajo Control</span>
                                    <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-black">{risks.filter(r => r.probability * r.impact < 4).length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm transition-all hover:border-primary-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Info className="mr-2 text-primary-500" />
                                Guía de Evaluación
                            </h4>
                            <div className="space-y-4 text-sm text-gray-600">
                                <p className="leading-relaxed">
                                    <strong className="text-gray-900">Probabilidad:</strong> 1 (Remoto) a 5 (Casi Seguro).
                                </p>
                                <p className="leading-relaxed">
                                    <strong className="text-gray-900">Impacto:</strong> 1 (Insignificante) a 5 (Catastrófico).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List View */}
                <div className="mt-12 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Inventario de Riesgos</h3>
                        <button className="text-primary-600 font-bold hover:underline text-sm">Exportar Matriz</button>
                    </div>
                    {isLoading ? (
                        <p className="p-12 text-center text-gray-400">Cargando riesgos...</p>
                    ) : risks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-8 py-4">Descripción</th>
                                        <th className="px-8 py-4 text-center">Nivel</th>
                                        <th className="px-8 py-4 text-center">Score</th>
                                        <th className="px-8 py-4">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {risks.map(risk => (
                                        <tr key={risk.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <td className="px-8 py-5 font-medium text-gray-900 group-hover:text-primary-600">{risk.description}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getRiskColor(risk.probability, risk.impact)}`}>
                                                    {risk.probability * risk.impact >= 15 ? 'Extremo' : risk.probability * risk.impact >= 8 ? 'Alto' : 'Moderado'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold tabular-nums text-gray-400">{risk.probability * risk.impact}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center text-xs font-bold text-gray-500">
                                                    <CheckCircle2 size={14} className="mr-2 text-green-500" />
                                                    Activo
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <ShieldAlert size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500">No se han identificado riesgos aún.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Risks;
