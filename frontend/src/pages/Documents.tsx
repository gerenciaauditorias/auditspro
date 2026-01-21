import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    File,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Eye,
    Edit,
    Trash2,
    Share2,
    Send
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
    updatedAt: string;
}

const Documents: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        code: '',
        type: 'procedure' as 'manual' | 'procedure' | 'instruction' | 'format' | 'record' | 'other',
        content: ''
    });

    const [formErrors, setFormErrors] = useState({
        title: '',
        code: ''
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await apiClient.get('/documents');
            if (response.data.status === 'success') {
                setDocuments(response.data.data.documents);
            }
        } catch (error) {
            toast.error('Error al cargar documentos');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const errors = { title: '', code: '' };
        let isValid = true;

        if (!formData.title.trim()) {
            errors.title = 'El nombre es obligatorio';
            isValid = false;
        }

        if (!formData.code.trim()) {
            errors.code = 'El código es obligatorio';
            isValid = false;
        } else if (!/^[A-Z0-9-]+$/i.test(formData.code)) {
            errors.code = 'El código solo puede contener letras, números y guiones';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleCreateDocument = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/documents', formData);

            if (response.data.status === 'success') {
                toast.success('Documento creado exitosamente');
                setIsCreateModalOpen(false);

                // Reset form
                setFormData({
                    title: '',
                    code: '',
                    type: 'procedure',
                    content: ''
                });
                setFormErrors({ title: '', code: '' });

                // Refresh document list
                fetchDocuments();
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Error al crear el documento';
            toast.error(message);

            // Handle specific validation errors
            if (error.response?.status === 400 && message.includes('code')) {
                setFormErrors(prev => ({ ...prev, code: message }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setFormData({
            title: '',
            code: '',
            type: 'procedure',
            content: ''
        });
        setFormErrors({ title: '', code: '' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 size={12} className="mr-1" />
                        Aprobado
                    </span>
                );
            case 'under_review':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock size={12} className="mr-1" />
                        En Revisión
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <AlertCircle size={12} className="mr-1" />
                        Borrador
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Obsoleto
                    </span>
                );
        }
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            manual: 'Manual',
            procedure: 'Procedimiento',
            instruction: 'Instructivo',
            format: 'Formato',
            record: 'Registro',
            other: 'Otro'
        };
        return types[type] || type;
    };

    const filteredDocuments = documents.filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDocument = (id: string) => {
        navigate(`/documents/${id}`);
    };

    const handleDeleteDocument = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return;

        try {
            await apiClient.delete(`/documents/${id}`);
            toast.success('Documento eliminado');
            fetchDocuments();
        } catch (error) {
            toast.error('Error al eliminar documento');
        }
    };

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestión Documental</h2>
                        <p className="text-gray-500 mt-1">Control de versiones y ciclo de vida de documentos ISO.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} className="mr-2" />
                        Nuevo Documento
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white">
                            <option value="">Todos los Tipos</option>
                            <option value="manual">Manuales</option>
                            <option value="procedure">Procedimientos</option>
                            <option value="instruction">Instructivos</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white">
                            <option value="">Cualquier Estado</option>
                            <option value="approved">Aprobados</option>
                            <option value="under_review">En Revisión</option>
                            <option value="draft">Borrador</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Cargando documentos...</div>
                    ) : filteredDocuments.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Documento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                            {doc.code || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center cursor-pointer" onClick={() => handleViewDocument(doc.id)}>
                                                <FileText className="text-primary-600 mr-3" size={20} />
                                                <span className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">{doc.fileName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getTypeLabel(doc.type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            v{doc.version}.0
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(doc.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(doc.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDocument(doc.id)}
                                                className="text-gray-400 hover:text-primary-600 px-2 group"
                                                title="Ver documento"
                                            >
                                                <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </button>
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => toggleMenu(doc.id)}
                                                    className="text-gray-400 hover:text-gray-600 px-2"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openMenuId === doc.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    handleViewDocument(doc.id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <Eye size={16} className="mr-2" />
                                                                Ver detalles
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    // TODO: Implement edit
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <Edit size={16} className="mr-2" />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    // TODO: Implement share
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <Share2 size={16} className="mr-2" />
                                                                Compartir
                                                            </button>
                                                            {doc.status === 'draft' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await apiClient.post(`/documents/${doc.id}/request-approval`);
                                                                            toast.success('Enviado para aprobación');
                                                                            fetchDocuments();
                                                                        } catch (error) {
                                                                            toast.error('Error al enviar');
                                                                        }
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                                >
                                                                    <Send size={16} className="mr-2" />
                                                                    Enviar para aprobación
                                                                </button>
                                                            )}
                                                            <hr className="my-1" />
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteDocument(doc.id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                                            >
                                                                <Trash2 size={16} className="mr-2" />
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <File size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay documentos</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mb-4">
                                Comienza subiendo tus procedimientos, manuales o instructivos de calidad.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                            >
                                <Plus size={16} className="mr-2" />
                                Crear mi primer documento
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Creation Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Nuevo Documento</h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: Procedimiento de Compras"
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono ${formErrors.code ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: QMS-PR-01"
                                />
                                {formErrors.code && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="procedure">Procedimiento</option>
                                    <option value="instruction">Instructivo</option>
                                    <option value="manual">Manual</option>
                                    <option value="format">Formato</option>
                                    <option value="record">Registro</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                                    placeholder="Breve descripción del documento..."
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateDocument}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Creando...
                                    </>
                                ) : (
                                    'Crear Documento'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Documents;
