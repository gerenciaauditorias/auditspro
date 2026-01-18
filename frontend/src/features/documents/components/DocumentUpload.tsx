import React, { useState } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../../api/client';

export const DocumentUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await apiClient.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus('success');
            setFile(null);
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Upload size={20} className="text-primary-600" />
                Subir Documentación
            </h3>

            <div
                className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors
          ${file ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 hover:border-primary-400'}`}
            >
                {!file ? (
                    <>
                        <Upload className="text-gray-400 mb-4" size={40} />
                        <p className="text-sm text-gray-600 mb-2">Haz clic para seleccionar o arrastra un archivo</p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG (Hasta 10MB)</p>
                        <input
                            type="file"
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg"
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-between w-full space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-100 text-primary-600 rounded">
                                <File size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`w-full mt-4 py-2 px-4 rounded-lg font-medium text-white transition-all
            ${uploading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'}`}
                >
                    {uploading ? 'Subiendo...' : 'Comenzar Carga'}
                </button>
            )}

            {status === 'success' && (
                <div className="mt-4 flex items-center space-x-2 text-green-600 animate-in fade-in slide-in-from-top-1">
                    <CheckCircle size={18} />
                    <span className="text-sm font-medium">Documento subido correctamente</span>
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 flex items-center space-x-2 text-red-600 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">Error al subir el documento</span>
                </div>
            )}
        </div>
    );
};
