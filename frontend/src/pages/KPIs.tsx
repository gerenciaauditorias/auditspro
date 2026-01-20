import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    TrendingUp,
    Target,
    Activity,
    Calendar,
    Plus,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface KPI {
    id: string;
    name: string;
    category: string;
    unit: string;
    targetValue: number;
    direction: 'higher' | 'lower';
    measurements: { date: string, value: number }[];
}

const KPIs: React.FC = () => {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchKPIs();
    }, []);

    const fetchKPIs = async () => {
        try {
            const response = await apiClient.get('/kpis');
            if (response.data.status === 'success') {
                setKpis(response.data.data.kpis);
            }
        } catch (error) {
            toast.error('Error al cargar indicadores');
        } finally {
            setIsLoading(false);
        }
    };

    const getPerformanceStatus = (kpi: KPI) => {
        if (!kpi.measurements.length) return 'neutral';
        const lastValue = kpi.measurements[kpi.measurements.length - 1].value;
        const isHigher = lastValue >= kpi.targetValue;

        if (kpi.direction === 'higher') {
            return isHigher ? 'success' : 'danger';
        } else {
            return !isHigher ? 'success' : 'danger';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Indicadores de Desempeño (KPIs)</h2>
                        <p className="text-gray-500 mt-1">Monitorea el cumplimiento de tus metas y objetivos estratégicos.</p>
                    </div>
                    <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100 font-bold">
                        <Plus size={20} className="mr-2" />
                        Nuevo Indicador
                    </button>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {isLoading ? (
                        <div className="col-span-full text-center py-12 text-gray-400">Cargando indicadores...</div>
                    ) : kpis.length > 0 ? (
                        kpis.map((kpi) => (
                            <div key={kpi.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 block">{kpi.category}</span>
                                        <h3 className="text-lg font-bold text-gray-900">{kpi.name}</h3>
                                    </div>
                                    <div className={`p-2 rounded-lg ${getPerformanceStatus(kpi) === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        <Activity size={20} />
                                    </div>
                                </div>
                                <div className="p-6 flex-1">
                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Último Valor</p>
                                            <div className="flex items-baseline">
                                                <span className="text-3xl font-black text-gray-900">
                                                    {kpi.measurements.length ? kpi.measurements[kpi.measurements.length - 1].value : '--'}
                                                </span>
                                                <span className="ml-1 text-sm font-bold text-gray-400">{kpi.unit}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Meta</p>
                                            <div className="flex items-baseline">
                                                <span className="text-3xl font-black text-primary-600">{kpi.targetValue}</span>
                                                <span className="ml-1 text-sm font-bold text-gray-400">{kpi.unit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart Placeholder / Real Chart */}
                                    <div className="h-48 w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={kpi.measurements}>
                                                <defs>
                                                    <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide domain={['auto', 'auto']} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ fontWeight: 'bold' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#2563eb"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill={`url(#gradient-${kpi.id})`}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Frecuencia: Mensual</span>
                                    <button className="text-primary-600 font-bold hover:underline">Gestionar Datos</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white p-20 text-center rounded-3xl border border-gray-100 shadow-inner">
                            <TrendingUp size={64} className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Mide lo que importa</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Configura tus indicadores clave de desempeño para tener una visión clara del éxito de tu organización.
                            </p>
                            <button className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all">
                                Crear mi primer KPI
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default KPIs;
