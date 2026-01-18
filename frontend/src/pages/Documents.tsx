import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

const Documents: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900">Documentos y Auditorías</h2>
                <p className="text-gray-500 mt-2">Aquí puedes ver el listado completo de documentos subidos.</p>
                <div className="mt-8 bg-white p-8 border border-gray-200 rounded-xl text-center text-gray-400">
                    Módulo de listado en desarrollo...
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Documents;
