import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar as CalendarIcon, FileText, User, ShieldCheck, Plus, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface AuditModalProps {
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

interface WizardStep {
    id: number;
    title: string;
    description: string;
}

export const AuditModal: React.FC<AuditModalProps> = ({ onSuccess, trigger }) => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'internal',
        isoStandard: '',
        scope: '',
        objectives: '',
        plannedDate: '',
        startDate: '',
        endDate: '',
        auditorId: '',
        responsibleIds: [] as string[],
        populateFromStandard: true
    });

    useEffect(() => {
        if (open) {
            fetchUsers();
            setStep(1);
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            if (response.data.status === 'success') {
                setUsers(response.data.data.users);
            }
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/audits', formData);
            if (response.data.status === 'success') {
                toast.success('Auditoría creada con éxito');
                setOpen(false);
                setFormData({
                    title: '', type: 'internal', isoStandard: '', scope: '', objectives: '',
                    plannedDate: '', startDate: '', endDate: '', auditorId: '',
                    responsibleIds: [], populateFromStandard: true
                });
                onSuccess();
            }
        } catch (error) {
            toast.error('Error al crear auditoría');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const renderStepContent = () => {
        switch (step) {
            case 1: // General & Standard
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Título</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: Auditoría Interna ISO 9001 - Q1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tipo</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="internal">Interna</option>
                                    <option value="external">Externa</option>
                                    <option value="supplier">Proveedor</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Norma ISO</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.isoStandard}
                                    onChange={e => setFormData({ ...formData, isoStandard: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="ISO 9001">ISO 9001 (Calidad)</option>
                                    <option value="ISO 14001">ISO 14001 (Ambiental)</option>
                                    <option value="ISO 27001">ISO 27001 (Seguridad)</option>
                                    <option value="Other">Otra / Personalizada</option>
                                </select>
                            </div>
                        </div>
                        {formData.isoStandard === 'ISO 9001' && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <input
                                    type="checkbox"
                                    checked={formData.populateFromStandard}
                                    onChange={e => setFormData({ ...formData, populateFromStandard: e.target.checked })}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span>Cargar checklist automático de la norma</span>
                            </div>
                        )}
                    </div>
                );
            case 2: // Scope & Objectives
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Alcance</label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.scope}
                                onChange={e => setFormData({ ...formData, scope: e.target.value })}
                                placeholder="Departamentos, procesos y ubicaciones a auditar..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Objetivos</label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.objectives}
                                onChange={e => setFormData({ ...formData, objectives: e.target.value })}
                                placeholder="Determinar la conformidad del sistema de gestión..."
                            />
                        </div>
                    </div>
                );
            case 3: // Team
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Auditor Líder</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.auditorId}
                                onChange={e => setFormData({ ...formData, auditorId: e.target.value })}
                            >
                                <option value="">Seleccionar auditor...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Equipo Auditor / Responsables</label>
                            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                {users.map(u => (
                                    <label key={u.id} className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={formData.responsibleIds.includes(u.id)}
                                            onChange={e => {
                                                const newIds = e.target.checked
                                                    ? [...formData.responsibleIds, u.id]
                                                    : formData.responsibleIds.filter(id => id !== u.id);
                                                setFormData({ ...formData, responsibleIds: newIds });
                                            }}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">{u.name} ({u.role})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 4: // Schedule
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Fecha Planificada (Inicio)</label>
                            <input
                                required
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.plannedDate}
                                onChange={e => setFormData({ ...formData, plannedDate: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Inicio Real (Estimado)</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Fin Estimado</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-4">
                            <h4 className="font-semibold text-yellow-800 mb-2">Resumen</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li><strong>Norma:</strong> {formData.isoStandard || 'N/A'}</li>
                                <li><strong>Checklist:</strong> {formData.populateFromStandard ? 'Automático' : 'Manual'}</li>
                                <li><strong>Responsables:</strong> {formData.responsibleIds.length} seleccionados</li>
                            </ul>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {trigger || (
                    <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium">
                        <Plus size={20} className="mr-2" />
                        Programar Auditoría
                    </button>
                )}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 p-0 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="bg-primary-600 p-6 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center">
                            <ShieldCheck className="mr-3" size={24} />
                            <div>
                                <Dialog.Title className="text-xl font-bold">Nueva Auditoría</Dialog.Title>
                                <p className="text-primary-100 text-sm">Paso {step} de 4</p>
                            </div>
                        </div>
                        <Dialog.Close className="hover:bg-white/10 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </Dialog.Close>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2 shrink-0">
                        <div
                            className="bg-primary-500 h-2 transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>

                    {/* Body */}
                    <div className="p-8 overflow-y-auto flex-1">
                        {renderStepContent()}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50 flex justify-between shrink-0">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={step === 1}
                            className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 disabled:opacity-50 flex items-center"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Anterior
                        </button>

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                            >
                                Siguiente <ArrowRight size={16} className="ml-2" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg flex items-center disabled:opacity-50"
                            >
                                {isLoading ? 'Creando...' : 'Finalizar y Crear'} <CheckCircle size={16} className="ml-2" />
                            </button>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
