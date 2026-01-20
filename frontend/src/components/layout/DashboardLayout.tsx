import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Search, Bell, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/hooks/useAuth';

interface LayoutProps {
    children: React.ReactNode;
}

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active?: boolean }) => (
    <Link
        to={to}
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 hover:bg-gray-100'}`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
);

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6">
                    <Link to="/dashboard" className="text-xl font-bold text-primary-600">Auditorías <span className="text-gray-900">Online</span></Link>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2 pb-4">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
                    <SidebarItem icon={FileText} label="Documentos" to="/documents" active={location.pathname === '/documents'} />
                    <SidebarItem icon={FileText} label="Auditorías" to="/audits" active={location.pathname === '/audits'} />
                    <SidebarItem icon={FileText} label="No Conformidades" to="/ncs" active={location.pathname === '/ncs'} />
                    <SidebarItem icon={ShieldAlert} label="Gestión de Riesgos" to="/risks" active={location.pathname === '/risks'} />
                    <SidebarItem icon={FileText} label="Indicadores / KPIs" to="/kpis" active={location.pathname === '/kpis'} />
                    <SidebarItem icon={Settings} label="Configuración" to="/settings" active={location.pathname === '/settings'} />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <SidebarItem icon={LogOut} label="Cerrar Sesión" to="/logout" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar auditorías o documentos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 transition-colors p-1 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Usuario'}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Miembro'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable body */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
