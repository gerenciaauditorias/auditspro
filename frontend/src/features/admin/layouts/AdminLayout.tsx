import React from 'react';
import { LayoutDashboard, Building, Users, FileText, AlertTriangle, Settings, LogOut, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

interface LayoutProps {
    children: React.ReactNode;
}

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active?: boolean }) => (
    <Link
        to={to}
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 hover:bg-gray-100'}`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
);

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 flex items-center space-x-2">
                    <Shield className="text-indigo-600" size={28} />
                    <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                </div>

                <div className="px-6 pb-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestión Global</div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/admin" active={location.pathname === '/admin'} />
                    <SidebarItem icon={Building} label="Organizaciones" to="/admin/tenants" active={location.pathname === '/admin/tenants'} />
                    <SidebarItem icon={Users} label="Usuarios" to="/admin/users" active={location.pathname === '/admin/users'} />
                    <SidebarItem icon={FileText} label="Documentos" to="/admin/documents" active={location.pathname === '/admin/documents'} />
                    <SidebarItem icon={FileText} label="Auditorías" to="/admin/audits" active={location.pathname === '/admin/audits'} />
                    <SidebarItem icon={AlertTriangle} label="No Conformidades" to="/admin/ncs" active={location.pathname === '/admin/ncs'} />

                    <div className="pt-4 pb-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sistema</div>
                    </div>
                    <SidebarItem icon={Settings} label="Configuración" to="/admin/config" active={location.pathname === '/admin/config'} />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center p-2 mb-2 rounded-lg bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase text-sm">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Link to="/logout" className="flex items-center space-x-2 text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
