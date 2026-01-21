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
    Eye,
    X,
    Plus,
    Mail,
    Shield
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
    const [permissions, setPermissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'permissions'>('details');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePermission, setSharePermission] = useState<'read' | 'write' | 'approve'>('read');
    const [pendingInviteEmail, setPendingInviteEmail] = useState('');

    useEffect(() => {
        if (id) {
            fetchDocument();
            fetchVersions();
            fetchPermissions();
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

    const fetchPermissions = async () => {
        try {
            const response = await apiClient.get(`/documents/${id}/permissions`);
            if (response.data.status === 'success') {
                setPermissions(response.data.data.permissions);
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
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Gestión de Permisos</h3>
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Agregar Usuario
                                    </button>
                                </div>

                                {permissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {permissions.map((perm) => (
                                            <div key={perm.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <Users size={20} className="text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{perm.user?.fullName || 'Usuario'}</p>
                                                        <p className="text-sm text-gray-500">{perm.user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${perm.permission === 'approve' ? 'bg-purple-100 text-purple-700' :
                                                        perm.permission === 'write' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {perm.permission === 'approve' ? 'Aprobar' : perm.permission === 'write' ? 'Editar' : 'Ver'}
                                                    </span>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('¿Revocar este permiso?')) {
                                                                try {
                                                                    await apiClient.delete(`/documents/${id}/permissions/${perm.id}`);
                                                                    toast.success('Permiso revocado');
                                                                    fetchPermissions();
                                                                } catch (error) {
                                                                    toast.error('Error al revocar permiso');
                                                                }
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Shield size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No hay permisos específicos asignados</p>
                                        <p className="text-sm text-gray-400 mt-1">Los permisos se heredan de los roles de usuario</p>
                                    </div>
                                )}
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
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                                >
                                    <Share2 size={18} className="mr-2 text-gray-600" />
                                    Compartir
                                </button>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                                >
                                    <Edit size={18} className="mr-2 text-gray-600" />
                                    Editar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('¿Estás seguro de eliminar este documento?')) {
                                            try {
                                                await apiClient.delete(`/documents/${id}`);
                                                toast.success('Documento eliminado');
                                                navigate('/documents');
                                            } catch (error) {
                                                toast.error('Error al eliminar');
                                            }
                                        }
                                    }}
                                    className="w-full px-4 py-2 text-left border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                                >
                                    <Trash2 size={18} className="mr-2" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Modal */}
                {isShareModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Compartir Documento</h3>
                                <button
                                    onClick={() => setIsShareModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email del usuario
                                    </label>
                                    <input
                                        type="email"
                                        value={shareEmail}
                                        onChange={(e) => setShareEmail(e.target.value)}
                                        placeholder="usuario@ejemplo.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nivel de permiso
                                    </label>
                                    <select
                                        value={sharePermission}
                                        onChange={(e) => setSharePermission(e.target.value as 'read' | 'write' | 'approve')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="read">Solo lectura</option>
                                        <option value="write">Editar</option>
                                        <option value="approve">Aprobar</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsShareModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!shareEmail) {
                                            toast.error('Ingresa un email');
                                            return;
                                        }
                                        try {
                                            await apiClient.post(`/documents/${id}/permissions`, {
                                                email: shareEmail,
                                                permission: sharePermission
                                            });
                                            toast.success('Permiso otorgado');
                                            setIsShareModalOpen(false);
                                            setShareEmail('');
                                            fetchPermissions();
                                        } catch (error: any) {
                                            // Check if user not found
                                            if (error.response?.status === 404 && error.response?.data?.message?.includes('User not found')) {
                                                // Show invitation modal
                                                setPendingInviteEmail(shareEmail);
                                                setIsShareModalOpen(false);
                                                setIsInviteModalOpen(true);
                                            } else {
                                                toast.error(error.response?.data?.message || 'Error al compartir');
                                            }
                                        }
                                    }}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                                >
                                    Compartir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                                <h3 className="text-xl font-semibold text-gray-900">Editar Documento</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Nota:</strong> La funcionalidad completa de edición con WYSIWYG está en desarrollo.
                                        Por ahora, puedes actualizar los metadatos del documento desde la API.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            defaultValue={document?.fileName}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                                        <input
                                            type="text"
                                            defaultValue={document?.code}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                        <textarea
                                            defaultValue={document?.description}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invitation Modal */}
                {isInviteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Usuario No Encontrado</h3>
                                <button
                                    onClick={() => {
                                        setIsInviteModalOpen(false);
                                        setPendingInviteEmail('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <AlertCircle size={24} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-medium mb-2">
                                            El usuario <span className="text-primary-600">{pendingInviteEmail}</span> no está registrado en tu organización.
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            ¿Deseas enviar una invitación para que se una a tu organización?
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Nota:</strong> Una vez que el usuario acepte la invitación y se registre,
                                        podrás compartir documentos con él.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsInviteModalOpen(false);
                                        setPendingInviteEmail('');
                                        setShareEmail('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await apiClient.post('/invitations', {
                                                email: pendingInviteEmail,
                                                role: 'user'
                                            });
                                            toast.success(`Invitación enviada a ${pendingInviteEmail}`);
                                            setIsInviteModalOpen(false);
                                            setPendingInviteEmail('');
                                            setShareEmail('');
                                        } catch (error: any) {
                                            toast.error(error.response?.data?.message || 'Error al enviar invitación');
                                        }
                                    }}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                                >
                                    <Mail size={18} />
                                    Enviar Invitación
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DocumentDetail;
export default DocumentDetail;
