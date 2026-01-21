import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Users, Plus, Edit, Trash2, Loader2, Mail, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserModal } from './UserModal';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            if (response.data.status === 'success') {
                setUsers(response.data.data.users);
            }
        } catch (error) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`¿Desactivar usuario ${user.fullName}?`)) return;

        try {
            await apiClient.delete(`/users/${user.id}`);
            toast.success('Usuario desactivado');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al desactivar usuario');
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            tenant_admin: 'bg-purple-100 text-purple-800',
            auditor: 'bg-blue-100 text-blue-800',
            user: 'bg-gray-100 text-gray-800',
            consultant: 'bg-green-100 text-green-800'
        };
        return colors[role] || colors.user;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
                    <p className="text-sm text-gray-500">{users.length} usuarios en total</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center"
                >
                    <Plus size={18} className="mr-2" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Creación
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Users size={20} className="text-primary-600" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                            <div className="text-sm text-gray-500 flex items-center">
                                                <Mail size={12} className="mr-1" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        {user.isActive ? (
                                            <span className="flex items-center text-green-600 text-sm">
                                                <UserCheck size={16} className="mr-1" />
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600 text-sm">
                                                <UserX size={16} className="mr-1" />
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-primary-600 hover:text-primary-900 mr-3"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user)}
                                        className="text-red-600 hover:text-red-900"
                                        disabled={!user.isActive}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Modal */}
            {modalOpen && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => {
                        setModalOpen(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};
