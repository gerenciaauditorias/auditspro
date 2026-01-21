import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FileText, Users, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

const StatCard = ({ title, value, icon: Icon, color, to = "#" }: { title: string, value: string, icon: any, color: string, to?: string }) => (
    <Link to={to} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-primary-200 group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 group-hover:text-primary-600 transition-colors">{title}</p>
                <h4 className="text-2xl font-bold mt-1 text-gray-900">{value}</h4>
            </div>
            <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    </Link>
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo, {user?.fullName?.split(' ')[0] || 'Usuario'}</h2>
                    <p className="text-gray-500">Aquí tienes un resumen de tus auditorías y documentos.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Auditorías"
                        value="24"
                        icon={FileText}
                        color="bg-blue-50 text-blue-600"
                        to="/documents"
                    />
                    <StatCard
                        title="Pendientes"
                        value="12"
                        icon={Clock}
                        color="bg-amber-50 text-amber-600"
                        to="/audits?status=pending"
                    />
                    <StatCard
                        title="Completadas"
                        value="8"
                        icon={CheckCircle}
                        color="bg-green-50 text-green-600"
                        to="/audits?status=completed"
                    />
                    <StatCard
                        title="Usuarios"
                        value="156"
                        icon={Users}
                        color="bg-purple-50 text-purple-600"
                        to="/settings/users"
                    />
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Main List */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Auditorías Recientes</h3>
                                <button className="text-sm text-primary-600 font-medium hover:underline">Ver todas</button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-gray-100 rounded text-gray-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Auditoría de Seguridad - Planta {i}</p>
                                                <p className="text-sm text-gray-500">Subido por Juan Perez • Hace 2 horas</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                                                En Proceso
                                            </span>
                                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
