import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { DashboardLayout as Layout } from '../components/layout/DashboardLayout';
import { ArrowLeft, Calendar, User, ShieldCheck, Loader2 } from 'lucide-react';
import { AuditExecution } from '../features/audits/components/AuditExecution';

export const AuditDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAudit = async () => {
        try {
            const response = await apiClient.get(`/audits/${id}`);
            if (response.data.status === 'success') {
                setAudit(response.data.data.audit);
            }
        } catch (error) {
            console.error('Error fetching audit', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAudit();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="animate-spin text-primary-600" size={40} />
                </div>
            </Layout>
        );
    }

    if (!audit) {
        return (
            <Layout>
                <div className="p-8 text-center text-gray-500">Auditoría no encontrada</div>
            </Layout>
        );
    }

    const completedChecks = audit.checklists?.filter((c: any) => c.isCompliant !== null).length || 0;
    const totalChecks = audit.checklists?.length || 0;
    const progress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => navigate('/audits')}
                        className="self-start text-gray-500 hover:text-gray-900 flex items-center transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Volver a Auditorías
                    </button>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{audit.title}</h1>
                                <div className="flex items-center space-x-6 text-gray-500">
                                    <div className="flex items-center">
                                        <ShieldCheck size={18} className="mr-2 text-primary-500" />
                                        <span>{audit.isoStandard || 'Sin norma'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar size={18} className="mr-2 text-primary-500" />
                                        <span>{new Date(audit.plannedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User size={18} className="mr-2 text-primary-500" />
                                        <span>{audit.leadAuditor?.fullName || 'Sin asignar'}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize
                                ${audit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    audit.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                {audit.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-600">
                                <span>Progreso de Auditoría</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-primary-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Execution View */}
                <AuditExecution
                    auditId={audit.id}
                    checklists={audit.checklists || []}
                    onUpdate={fetchAudit}
                />
            </div>
        </Layout>
    );
};
