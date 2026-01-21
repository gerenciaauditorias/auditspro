import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    FileText,
    ArrowLeft,
    Download,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    History,
    MessageSquare,
    Share2,
    Eye
} from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface Document {
    id: string;
    code: string;
    fileName: string;
    type: string;
    version: number;
    status: 'draft' | 'under_review' | 'approved' | 'obsolete';
    category?: string;
    area?: string;
    description?: string;
    tags?: string[];
    confidentialityLevel?: string;
    isCritical?: boolean;
    appliesToAudits?: boolean;
    nextReviewDate?: string;
    reviewFrequencyMonths?: number;
    content?: string;
    createdAt: string;
    updatedAt: string;
    responsibleUser?: {
        id: string;
        fullName: string;
        email: string;
    };
    uploadedBy?: {
        id: string;
        fullName: string;
        email: string;
    };
}

interface Version {
    id: string;
    version: string;
    changes: string;
    createdAt: string;
    createdBy: {
        fullName: string;
    };
}

const DocumentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = useState<Document | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'permissions'>('details');

    useEffect(() => {
        if (id) {
            fetchDocument();
            fetchVersions();
        }
    }, [id]);

    const fetchDocument = async () => {
        try {
            const response = await apiClient.get(`/documents/${id}`);
            if (response.data.status === 'success') {
                setDocument(response.data.data.document);
            }
        } catch (error) {
            toast.error('Error al cargar el documento');
            navigate('/documents');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVersions = async () => {
        try {
            const response = await apiClient.get(`/documents/${id}/versions`);
            if (response.data.status === 'success') {
                setVersions(response.data.data.versions);
            }
        } catch (error) {
            console.error('Error loading versions:', error);
        }
    };

    const handleRequestApproval = async () => {
        try {
            await apiClient.post(`/documents/${id}/request-approval`);
            toast.success('Documento enviado para aprobación');
            fetchDocument();
        } catch (error) {
            toast.error('Error al enviar para aprobación');
        }
    };

    const handleApprove = async () => {
        try {
            await apiClient.post(`/documents/${id}/approve`, {
                comments: 'Aprobado'
            });
            toast.success('Documento aprobado');
            fetchDocument();
        } catch (error) {
            toast.error('Error al aprobar documento');
        }
    };

    const handleReject = async () => {
        const reason = prompt('Motivo del rechazo:');
        if (!reason) return;

        try {
            await apiClient.post(`/documents/${id}/reject`, {
                comments: reason
            });
            toast.success('Documento rechazado');
            fetchDocument();
        } catch (error) {
            toast.error('Error al rechazar documento');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle2 size={16} className="mr-1" />
                        Aprobado
                    </span>
                );
            case 'under_review':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Clock size={16} className="mr-1" />
                        En Revisión
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <AlertCircle size={16} className="mr-1" />
                        Borrador
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Obsoleto
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!document) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Documento no encontrado</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/documents')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Volver a documentos
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="text-primary-600" size={32} />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{document.fileName}</h1>
                                    <p className="text-gray-500 font-mono text-sm">{document.code}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                                {getStatusBadge(document.status)}
                                <span className="text-sm text-gray-500">v{document.version}.0</span>
                                {document.isCritical && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Crítico
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {document.status === 'draft' && (
                                <button
                                    onClick={handleRequestApproval}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Enviar para Aprobación
                                </button>
                            )}
                            {document.status === 'under_review' && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Rechazar
                                    </button>
                                </>
                            )}
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Eye size={18} className="inline mr-2" />
                            Detalles
                        </button>
                        <button
                            onClick={() => setActiveTab('versions')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'versions'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <History size={18} className="inline mr-2" />
                            Historial ({versions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('permissions')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Users size={18} className="inline mr-2" />
                            Permisos
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'details' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold mb-4">Información del Documento</h3>

                                {document.description && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                        <p className="text-gray-600">{document.description}</p>
                                    </div>
                                )}

                                {document.content && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                                        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                                            {document.content}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <p className="text-gray-900">{document.type}</p>
                                    </div>
                                    {document.category && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                            <p className="text-gray-900">{document.category}</p>
                                        </div>
                                    )}
                                    {document.area && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                                            <p className="text-gray-900">{document.area}</p>
                                        </div>
                                    )}
                                    {document.confidentialityLevel && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confidencialidad</label>
                                            <p className="text-gray-900 capitalize">{document.confidentialityLevel}</p>
                                        </div>
                                    )}
                                </div>

                                {document.tags && document.tags.length > 0 && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                                        <div className="flex flex-wrap gap-2">
                                            {document.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'versions' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold mb-4">Historial de Versiones</h3>
                                <div className="space-y-4">
                                    {versions.map((version) => (
                                        <div key={version.id} className="border-l-4 border-primary-600 pl-4 py-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900">Versión {version.version}</p>
                                                    <p className="text-sm text-gray-600">{version.changes}</p>
                                                </div>
                                                <div className="text-right text-sm text-gray-500">
                                                    <p>{version.createdBy.fullName}</p>
                                                    <p>{new Date(version.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'permissions' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold mb-4">Gestión de Permisos</h3>
                                <p className="text-gray-500">Funcionalidad de permisos en desarrollo</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-4">Metadatos</h3>
                            <div className="space-y-3">
                                {document.responsibleUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                                        <p className="text-gray-900">{document.responsibleUser.fullName}</p>
                                        <p className="text-sm text-gray-500">{document.responsibleUser.email}</p>
                                    </div>
                                )}
                                {document.uploadedBy && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Creado por</label>
                                        <p className="text-gray-900">{document.uploadedBy.fullName}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Creado</label>
                                    <p className="text-gray-900">{new Date(document.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Última actualización</label>
                                    <p className="text-gray-900">{new Date(document.updatedAt).toLocaleDateString()}</p>
                                </div>
                                {document.nextReviewDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Próxima revisión</label>
                                        <p className="text-gray-900">{new Date(document.nextReviewDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                            <div className="space-y-2">
                                <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                                    <Share2 size={18} className="mr-2 text-gray-600" />
                                    Compartir
                                </button>
                                <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                                    <Edit size={18} className="mr-2 text-gray-600" />
                                    Editar
                                </button>
                                <button className="w-full px-4 py-2 text-left border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center">
                                    <Trash2 size={18} className="mr-2" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DocumentDetail;
