import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Building, Users, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    icon: any;
}

const steps: OnboardingStep[] = [
    {
        id: 1,
        title: 'Información de la Empresa',
        description: 'Completa los detalles de tu organización',
        icon: Building
    },
    {
        id: 2,
        title: 'Configuración de Usuarios',
        description: 'Define roles y permisos iniciales',
        icon: Users
    },
    {
        id: 3,
        title: 'Documentación Inicial',
        description: 'Configura tus primeros documentos',
        icon: FileText
    }
];

const OnboardingWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [companyData, setCompanyData] = useState({
        industry: '',
        employeeCount: '',
        address: '',
        phone: ''
    });

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Save onboarding data
            await apiClient.post('/tenant/onboarding', {
                ...companyData,
                onboardingCompleted: true
            });

            toast.success('¡Configuración completada! Bienvenido a Auditorías en Línea');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Error al guardar la configuración');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industria / Sector
                            </label>
                            <select
                                value={companyData.industry}
                                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="manufacturing">Manufactura</option>
                                <option value="services">Servicios</option>
                                <option value="healthcare">Salud</option>
                                <option value="education">Educación</option>
                                <option value="technology">Tecnología</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Empleados
                            </label>
                            <select
                                value={companyData.employeeCount}
                                onChange={(e) => setCompanyData({ ...companyData, employeeCount: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Selecciona un rango</option>
                                <option value="1-10">1-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-500">201-500</option>
                                <option value="500+">500+</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección
                            </label>
                            <input
                                type="text"
                                value={companyData.address}
                                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Calle, Ciudad, País"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                value={companyData.phone}
                                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="+54 11 1234-5678"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Roles Predefinidos</h4>
                            <p className="text-sm text-blue-700 mb-3">
                                Tu cuenta ya incluye los siguientes roles:
                            </p>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    <strong>Administrador:</strong> Control total del sistema
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    <strong>Auditor:</strong> Realiza y gestiona auditorías
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    <strong>Usuario:</strong> Acceso básico a documentos
                                </li>
                            </ul>
                        </div>
                        <p className="text-sm text-gray-600">
                            Podrás invitar usuarios y asignar roles desde el panel de configuración.
                        </p>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-2">¡Todo Listo!</h4>
                            <p className="text-sm text-green-700 mb-3">
                                Tu plataforma está configurada y lista para usar. Podrás:
                            </p>
                            <ul className="space-y-2 text-sm text-green-800">
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    Subir y gestionar documentos de calidad
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    Programar y ejecutar auditorías internas
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    Gestionar no conformidades
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2" size={16} />
                                    Generar reportes y métricas
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary-600 text-white p-6">
                    <h1 className="text-2xl font-bold mb-2">Configuración Inicial</h1>
                    <p className="text-primary-100">
                        Completa estos pasos para comenzar a usar la plataforma
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${currentStep >= step.id
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <Check size={20} />
                                        ) : (
                                            <step.icon size={20} />
                                        )}
                                    </div>
                                    <span className="text-xs text-center font-medium text-gray-700">
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 mt-[-20px] transition-colors ${currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {steps[currentStep - 1].title}
                    </h2>
                    <p className="text-gray-600 mb-6">{steps[currentStep - 1].description}</p>

                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                        Omitir configuración
                    </button>

                    <div className="flex space-x-3">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrevious}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Anterior
                            </button>
                        )}

                        {currentStep < steps.length ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
                            >
                                Siguiente
                                <ArrowRight size={16} className="ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                            >
                                {isLoading ? 'Guardando...' : 'Completar'}
                                <Check size={16} className="ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
