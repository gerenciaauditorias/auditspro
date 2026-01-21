import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, Save } from 'lucide-react';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';
import { NCModal } from '../../ncs/components/NCModal';

interface ChecklistItem {
    id: string;
    section: string;
    question: string;
    isCompliant: boolean | null;
    auditorNotes: string;
}

interface AuditExecutionProps {
    auditId: string;
    checklists: ChecklistItem[];
    onUpdate: () => void;
}

export const AuditExecution: React.FC<AuditExecutionProps> = ({ auditId, checklists, onUpdate }) => {
    const [filter, setFilter] = useState<'all' | 'compliant' | 'non_compliant' | 'pending'>('all');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [ncModalOpen, setNcModalOpen] = useState(false);
    const [selectedChecklistForNC, setSelectedChecklistForNC] = useState<ChecklistItem | null>(null);

    // Group by section
    const groupedItems = checklists.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, ChecklistItem[]>);

    const handleToggleCompliance = async (item: ChecklistItem, status: boolean) => {
        setSavingId(item.id);
        try {
            await apiClient.patch(`/audits/${auditId}/checklist/${item.id}`, {
                isCompliant: status
            });
            onUpdate();
        } catch (error) {
            toast.error('Error al actualizar');
        } finally {
            setSavingId(null);
        }
    };

    const handleNotesChange = async (item: ChecklistItem, notes: string) => {
        // Debounce or save on blur ideally, simplifying here
    };

    const handleSaveNotes = async (item: ChecklistItem, notes: string) => {
        setSavingId(item.id);
        try {
            await apiClient.patch(`/audits/${auditId}/checklist/${item.id}`, {
                auditorNotes: notes
            });
            onUpdate();
            toast.success('Notas guardadas');
        } catch (error) {
            toast.error('Error al guardar notas');
        } finally {
            setSavingId(null);
        }
    };

    const openNC = (item: ChecklistItem) => {
        setSelectedChecklistForNC(item);
        setNcModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Lista de Verificación</h3>
                    <p className="text-sm text-gray-500">{checklists.length} puntos de control</p>
                </div>
                <div className="flex space-x-2">
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        {checklists.filter(c => c.isCompliant === true).length} Cumple
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                        {checklists.filter(c => c.isCompliant === false).length} No Cumple
                    </div>
                </div>
            </div>

            {Object.entries(groupedItems).map(([section, items]) => (
                <div key={section} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 font-semibold text-gray-700">
                        Sección {section}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {items.map(item => (
                            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-medium mb-2">{item.question}</p>
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() => handleToggleCompliance(item, true)}
                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${item.isCompliant === true
                                                        ? 'bg-green-100 text-green-700 font-medium ring-2 ring-green-500 ring-offset-1'
                                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <CheckCircle size={16} />
                                                <span>Cumple</span>
                                            </button>
                                            <button
                                                onClick={() => handleToggleCompliance(item, false)}
                                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${item.isCompliant === false
                                                        ? 'bg-red-100 text-red-700 font-medium ring-2 ring-red-500 ring-offset-1'
                                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <XCircle size={16} />
                                                <span>No Cumple</span>
                                            </button>

                                            {item.isCompliant === false && (
                                                <button
                                                    onClick={() => openNC(item)}
                                                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                                >
                                                    <AlertTriangle size={16} />
                                                    <span>Crear NC</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-1/3">
                                        <div className="relative">
                                            <textarea
                                                className="w-full text-sm border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all p-3"
                                                placeholder="Observaciones del auditor..."
                                                rows={2}
                                                defaultValue={item.auditorNotes || ''}
                                                onBlur={(e) => handleSaveNotes(item, e.target.value)}
                                            />
                                            <div className="absolute right-2 bottom-2 text-gray-400 pointer-events-none">
                                                <MessageSquare size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* NC Modal Integration */}
            {selectedChecklistForNC && (
                <NCModal
                    isOpen={ncModalOpen}
                    onClose={() => setNcModalOpen(false)}
                    onSuccess={() => {
                        setNcModalOpen(false);
                        toast.success('No conformidad registrada');
                    }}
                    auditId={auditId}
                    defaultDescription={`NC detectada en punto ${selectedChecklistForNC.section}: ${selectedChecklistForNC.question}`}
                />
            )}
        </div>
    );
};
