import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Building, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrganizationSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        employeeCount: '',
        address: '',
        phone: '',
        cuit: '',
        taxCondition: '',
        billingAddress: '',
        ivaCondition: ''
    });

    useEffect(() => {
        fetchTenantInfo();
    }, []);

    const fetchTenantInfo = async () => {
        try {
            const response = await apiClient.get('/tenant');
            if (response.data.status === 'success') {
                const tenant = response.data.data.tenant;
                setFormData({
                    companyName: tenant.companyName || '',
                    industry: tenant.industry || '',
                    employeeCount: tenant.employeeCount || '',
                    address: tenant.address || '',
                    phone: tenant.phone || '',
                    cuit: tenant.cuit || '',
                    taxCondition: tenant.taxCondition || '',
                    billingAddress: tenant.billingAddress || '',
                    ivaCondition: tenant.ivaCondition || ''
                });
            }
        } catch (error) {
            toast.error('Error al cargar información');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await apiClient.patch('/tenant', formData);
            toast.success('Información actualizada correctamente');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building size={20} className="mr-2 text-primary-600" />
                    Información de la Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Empresa
                        </label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Industria
                        </label>
                        <input
                            type="text"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ej: Manufactura, Servicios, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad de Empleados
                        </label>
                        <input
                            type="text"
                            name="employeeCount"
                            value={formData.employeeCount}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ej: 1-10, 11-50, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>
            </div>

            {/* Fiscal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información Fiscal (Argentina)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CUIT
                        </label>
                        <input
                            type="text"
                            name="cuit"
                            value={formData.cuit}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="XX-XXXXXXXX-X"
                            maxLength={13}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Condición Tributaria
                        </label>
                        <select
                            name="taxCondition"
                            value={formData.taxCondition}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="responsable_inscripto">Responsable Inscripto</option>
                            <option value="monotributo">Monotributo</option>
                            <option value="exento">Exento</option>
                            <option value="consumidor_final">Consumidor Final</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Condición IVA
                        </label>
                        <select
                            name="ivaCondition"
                            value={formData.ivaCondition}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="responsable_inscripto">Responsable Inscripto</option>
                            <option value="exento">Exento</option>
                            <option value="no_responsable">No Responsable</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección de Facturación
                        </label>
                        <input
                            type="text"
                            name="billingAddress"
                            value={formData.billingAddress}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Si es diferente a la dirección física"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                        <Save className="mr-2" size={18} />
                    )}
                    Guardar Cambios
                </button>
            </div>
        </form>
    );
};
