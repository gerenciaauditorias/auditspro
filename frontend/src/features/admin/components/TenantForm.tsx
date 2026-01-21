import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

const tenantSchema = z.object({
    companyName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    subdomain: z.string().min(3, 'El subdominio debe tener al menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
    planType: z.enum(['starter', 'professional', 'enterprise']),
    adminName: z.string().min(3, 'El nombre del admin debe tener al menos 3 caracteres'),
    adminEmail: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // For edit mode (optional implementation)
}

export const TenantForm: React.FC<TenantFormProps> = ({ onClose, onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<TenantFormData>({
        resolver: zodResolver(tenantSchema),
        defaultValues: initialData || {
            planType: 'starter'
        }
    });

    const onSubmit = async (data: TenantFormData) => {
        setLoading(true);
        try {
            if (initialData) {
                // Edit mode logic here if needed, but for now we focus on Create as per schema requiring password
                // For update, we might need a different schema (no password required)
                await apiClient.patch(`/admin/tenants/${initialData.id}`, data);
                toast.success('Organización actualizada');
            } else {
                await apiClient.post('/admin/tenants', data);
                toast.success('Organización creada exitosamente');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar organización');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Editar Organización' : 'Nueva Organización'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                        <input
                            {...register('companyName')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ej. Acme Corp"
                        />
                        {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio</label>
                        <div className="flex">
                            <input
                                {...register('subdomain')}
                                className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="acme"
                                disabled={!!initialData}
                            />
                            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                .auditorias.com
                            </span>
                        </div>
                        {errors.subdomain && <p className="text-red-500 text-xs mt-1">{errors.subdomain.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                        <select
                            {...register('planType')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="starter">Starter</option>
                            <option value="professional">Professional</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                        {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType.message}</p>}
                    </div>

                    {!initialData && (
                        <>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Administrador Inicial</h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                        <input
                                            {...register('adminName')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Juan Pérez"
                                        />
                                        {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            {...register('adminEmail')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="admin@acme.com"
                                        />
                                        {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                        <input
                                            type="password"
                                            {...register('password')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="******"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                            {initialData ? 'Guardar Cambios' : 'Crear Organización'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
