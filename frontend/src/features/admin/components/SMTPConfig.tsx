import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Mail, Save, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const SMTPConfig: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [formData, setFormData] = useState({
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: 'false',
        smtp_from: ''
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get('/admin/config?category=smtp');
            if (response.data.status === 'success') {
                const configs = response.data.data.configs;
                const newFormData: any = { ...formData };

                configs.forEach((config: any) => {
                    newFormData[config.key] = config.value;
                });

                setFormData(newFormData);
            }
        } catch (error) {
            toast.error('Error al cargar configuración SMTP');
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

        const updates = Object.entries(formData).map(([key, value]) => ({
            key,
            value
        }));

        try {
            await apiClient.patch('/admin/config', { configs: updates });
            toast.success('Configuración SMTP guardada');
        } catch (error: any) {
            toast.error('Error al guardar configuración');
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
        <div className="max-w-2xl">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Configuración SMTP</h3>
                    <p className="text-sm text-gray-500">Configura el servidor de correo para notificaciones e invitaciones.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Host SMTP</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="smtp_host"
                                    value={formData.smtp_host}
                                    onChange={handleChange}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="smtp.example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
                            <input
                                type="text"
                                name="smtp_port"
                                value={formData.smtp_port}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="587"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seguridad (SSL/TLS)</label>
                            <select
                                name="smtp_secure"
                                value={formData.smtp_secure}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="false">No (STARTTLS)</option>
                                <option value="true">Sí (SSL/TLS)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario SMTP</label>
                            <input
                                type="text"
                                name="smtp_user"
                                value={formData.smtp_user}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña SMTP</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="smtp_pass"
                                    value={formData.smtp_pass}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 pr-10"
                                    placeholder={formData.smtp_pass === '********' ? '********' : 'Ingrese nueva contraseña'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remitente por defecto</label>
                            <input
                                type="text"
                                name="smtp_from"
                                value={formData.smtp_from}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="noreply@auditoriasenlinea.com.ar"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
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
                            Guardar Configuración
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
