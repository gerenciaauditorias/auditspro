import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { Building, Users, FileText, CheckCircle, AlertCircle, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

interface DashboardData {
    cards: {
        totalTenants: number;
        totalUsers: number;
        totalAudits: number;
        activeAudits: number;
        totalNCs: number;
        pendingNCs: number;
        totalDocuments: number;
    };
    charts: {
        auditsByStatus: { status: string; count: string }[];
        ncsBySeverity: { severity: string; count: string }[];
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdminDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await apiClient.get('/admin/stats');
            if (response.data.status === 'success') {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!data) return <div>Error loading data</div>;

    const { cards, charts } = data;

    // Transform charts data for Recharts
    const auditData = charts.auditsByStatus.map(item => ({
        name: item.status.replace('_', ' ').toUpperCase(),
        value: parseInt(item.count)
    }));

    const ncData = charts.ncsBySeverity.map(item => ({
        name: item.severity.toUpperCase(),
        value: parseInt(item.count)
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Building} label="Organizaciones" value={cards.totalTenants} color="bg-blue-500" />
                <StatCard icon={Users} label="Usuarios Totales" value={cards.totalUsers} color="bg-indigo-500" />
                <StatCard icon={Activity} label="Auditorías Activas" value={cards.activeAudits} subValue={`de ${cards.totalAudits} totales`} color="bg-green-500" />
                <StatCard icon={AlertTriangle} label="NCs Pendientes" value={cards.pendingNCs} subValue={`de ${cards.totalNCs} totales`} color="bg-orange-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Auditorías</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={auditData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {auditData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">No Conformidades por Severidad</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ncData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d">
                                    {ncData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, subValue, color }: { icon: any, label: string, value: number, subValue?: string, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
        <div className={`p-3 rounded-lg mr-4 ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
    </div>
);
