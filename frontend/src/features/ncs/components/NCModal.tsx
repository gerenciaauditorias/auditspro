import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, FileText, Info, ShieldAlert, Plus } from 'lucide-react';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface NCModalProps {
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export const NCModal: React.FC<NCModalProps> = ({ onSuccess, trigger }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        source: 'audit',
        severity: 'medium',
        dueDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiClient.post('/ncs', formData);
            if (response.data.status === 'success') {
                toast.success('No Conformidad registrada con éxito');
                setOpen(false);
                setFormData({ title: '', description: '', source: 'audit', severity: 'medium', dueDate: '' });
                onSuccess();
            }
        } catch (error) {
            toast.error('Error al registrar NC');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {trigger || (
                    <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-100 font-bold">
                        <Plus size={20} className="mr-2" />
                        Reportar NC
                    </button>
                )}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 p-0 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="bg-red-600 p-6 text-white flex justify-between items-center">
                        <div className="flex items-center">
                            <AlertTriangle className="mr-3" size={24} />
                            <div>
                                <Dialog.Title className="text-xl font-bold">Reportar No Conformidad</Dialog.Title>
                                <Dialog.Description className="text-red-100 text-sm">Registra un hallazgo o incumplimiento detectado.</Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Título del Hallazgo</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Falta de registro de limpieza en área A"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Descripción detallada</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Describe con precisión qué ocurrió, dónde y qué evidencia existe..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Fuente</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium appearance-none"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                                >
                                    <option value="audit">Auditoría</option>
                                    <option value="process">Proceso Diario</option>
                                    <option value="customer">Reclamo Cliente</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Severidad</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium appearance-none"
                                    value={formData.severity}
                                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                                >
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Fecha Límite para Acción</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <Dialog.Close asChild>
                                <button type="button" className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                    Cancelar
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-50"
                            >
                                {isLoading ? 'Registrando...' : 'Reportar No Conformidad'}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
