import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Building, Users, FileText, ArrowRight, ArrowLeft, CreditCard, Shield, FileCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    icon: any;
}

const steps: OnboardingStep[] = [
    { id: 1, title: 'Organización', description: 'Detalles de tu empresa', icon: Building },
    { id: 2, title: 'Administrador', description: 'Completa tu perfil', icon: Users },
    { id: 3, title: 'Términos', description: 'Legal y privacidad', icon: FileText },
    { id: 4, title: 'Suscripción', description: 'Prueba gratuita 30 días', icon: CreditCard },
    { id: 5, title: 'Confirmar', description: 'Resumen final', icon: Check }
];

const OnboardingWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        // Org Info
        industry: '',
        employeeCount: '',
        address: '',
        city: '',
        country: '',
        phone: '',

        // Admin Info
        adminPosition: '',
        adminPhone: '',

        // Legal
        termsAccepted: false,
        privacyAccepted: false,

        // Payment (Mock)
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        billingAddress: '',
        billingEmail: ''
    });

    // Mock Card Validation (Luhn check simplified or just basic length)
    const isCardValid = () => {
        return formData.cardNumber.replace(/\s/g, '').length >= 15 &&
            formData.cardCvv.length >= 3 &&
            formData.cardExpiry.length === 5; // MM/YY
    };

    const handleNext = () => {
        // Validation Logic
        if (currentStep === 1) {
            if (!formData.industry || !formData.country || !formData.city) {
                return toast.error('Completa los campos obligatorios');
            }
        }
        if (currentStep === 2) {
            if (!formData.adminPosition || !formData.adminPhone) {
                return toast.error('Completa tu información de perfil');
            }
        }
        if (currentStep === 3) {
            if (!formData.termsAccepted || !formData.privacyAccepted) {
                return toast.error('Debes aceptar los términos y condiciones');
            }
        }
        if (currentStep === 4) {
            if (!isCardValid()) {
                return toast.error('Ingresa datos de tarjeta válidos');
            }
        }

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
            // Mock Payment Token
            const mockPaymentToken = `tok_visa_mock_${Date.now()}`;

            await apiClient.post('/tenant/onboarding', {
                ...formData,
                paymentToken: mockPaymentToken,
                onboardingCompleted: true
            });

            toast.success('¡Registro completado! Tu prueba de 30 días ha comenzado.');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al completar el registro');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Company Info
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Industria *</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500"
                                    value={formData.industry}
                                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                >
                                    <option value="">Selecciona...</option>
                                    <option value="manufacturing">Manufactura</option>
                                    <option value="services">Servicios</option>
                                    <option value="healthcare">Salud</option>
                                    <option value="technology">Tecnología</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empleados</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500"
                                    value={formData.employeeCount}
                                    onChange={e => setFormData({ ...formData, employeeCount: e.target.value })}
                                >
                                    <option value="">Selecciona...</option>
                                    <option value="1-10">1-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-200">51-200</option>
                                    <option value="200+">200+</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Empresa</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 2: // Admin Info
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                            <Users className="text-blue-500 mt-1" size={20} />
                            <div>
                                <h4 className="text-sm font-medium text-blue-900">Configura tu perfil</h4>
                                <p className="text-xs text-blue-700 mt-1">
                                    Necesitamos esta información para configurar tu cuenta de administrador principal.
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Puesto *</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Ej: Gerente de Calidad"
                                value={formData.adminPosition}
                                onChange={e => setFormData({ ...formData, adminPosition: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Directo / Celular *</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={formData.adminPhone}
                                onChange={e => setFormData({ ...formData, adminPhone: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 3: // Legal
                return (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Shield className="mr-2 text-primary-600" size={20} />
                                Términos y Condiciones
                            </h4>
                            <div className="h-40 overflow-y-auto text-xs text-gray-600 border p-4 rounded-lg mb-4 bg-gray-50">
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>
                                <p className="mt-2">1. <strong>Uso del Servicio</strong>: ...</p>
                                <p className="mt-2">2. <strong>Privacidad</strong>: ...</p>
                                {/* More lorem ipsum */}
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-primary-600 rounded"
                                        checked={formData.termsAccepted}
                                        onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">He leído y acepto los <a href="#" className="text-primary-600 underline">Términos de Servicio</a>.</span>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-primary-600 rounded"
                                        checked={formData.privacyAccepted}
                                        onChange={e => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">Acepto la <a href="#" className="text-primary-600 underline">Política de Privacidad</a>.</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 4: // Payment
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold">Prueba Gratuita de 30 Días</h3>
                                    <p className="text-indigo-100 text-sm mt-1">Acceso total a todas las funcionalidades.</p>
                                </div>
                                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                    Valor: $0
                                </span>
                            </div>
                            <div className="mt-6 text-xs text-indigo-100 bg-white bg-opacity-10 p-3 rounded-lg">
                                <p className="flex items-center">
                                    <Shield size={14} className="mr-2" />
                                    No se realizará ningún cobro hoy. El cobro iniciará el día 60 si decides continuar.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                <CreditCard className="mr-2 text-gray-500" size={18} />
                                Método de Pago Seguro
                            </h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Titular de la tarjeta</label>
                                    <input type="text"
                                        className="w-full border-b border-gray-300 py-2 focus:border-primary-500 focus:ring-0 px-0 bg-transparent transition-colors"
                                        placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                                        value={formData.cardName}
                                        onChange={e => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Número de Tarjeta</label>
                                        <div className="relative">
                                            <input type="text"
                                                className="w-full border-b border-gray-300 py-2 focus:border-primary-500 focus:ring-0 px-0 bg-transparent pl-8"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                                value={formData.cardNumber}
                                                onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                                            />
                                            <CreditCard className="absolute left-0 top-2.5 text-gray-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Vencimiento</label>
                                        <input type="text"
                                            className="w-full border-b border-gray-300 py-2 focus:border-primary-500 focus:ring-0 px-0 bg-transparent"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            value={formData.cardExpiry}
                                            onChange={e => setFormData({ ...formData, cardExpiry: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CVC / CVV</label>
                                        <input type="password"
                                            className="w-full border-b border-gray-300 py-2 focus:border-primary-500 focus:ring-0 px-0 bg-transparent"
                                            placeholder="123"
                                            maxLength={4}
                                            value={formData.cardCvv}
                                            onChange={e => setFormData({ ...formData, cardCvv: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center space-x-1 text-xs text-gray-400">
                                <Shield size={12} />
                                <span>Pagos procesados de forma segura con encriptación SSL de 256-bits.</span>
                            </div>
                        </div>
                    </div>
                );
            case 5: // Summary
                return (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="font-semibold text-gray-900">Resumen de Registro</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Organización</span>
                                    <span className="font-medium text-gray-900">{formData.industry} / {formData.country}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Administrador</span>
                                    <span className="font-medium text-gray-900">{formData.adminPosition}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Plan Inicial</span>
                                    <span className="font-medium text-primary-600">Freemium 30 Días</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Método de Pago</span>
                                    <span className="font-medium text-gray-900">Visa terminada en {formData.cardNumber.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Primer Cobro</span>
                                    <span className="font-medium text-gray-900">En 60 días (aprox)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                            <FileCheck className="mt-0.5 text-green-500 flex-shrink-0" size={16} />
                            <p>
                                Al hacer clic en "Completar", confirmas que la información es correcta y aceptas iniciar tu período de prueba bajo los términos acordados.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar / Progress */}
                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-8 flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
                        <p className="text-sm text-gray-500 mt-1">Completa los pasos para activar tu cuenta.</p>
                    </div>

                    <div className="space-y-6 flex-1">
                        {steps.map((step) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            return (
                                <div key={step.id} className={`flex items-start transition-opacity ${isActive || isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`p-2 rounded-lg mr-3 ${isCompleted ? 'bg-green-100 text-green-600' : isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'}`}>
                                        {isCompleted ? <Check size={16} /> : <step.icon size={16} />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>{step.title}</p>
                                        <p className="text-xs text-gray-500 leading-tight mt-0.5">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-400">
                            <Shield size={12} className="mr-1" />
                            Tu información está segura
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col p-8 md:p-12">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{steps[currentStep - 1].title}</h2>
                        {renderStepContent()}
                    </div>

                    {/* Navigation */}
                    <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center text-gray-600 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors ${currentStep === 1 ? 'opacity-0 cursor-default' : ''}`}
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Anterior
                        </button>

                        {currentStep < steps.length ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center bg-primary-600 text-white px-8 py-2.5 rounded-lg hover:bg-primary-700 font-medium shadow-md shadow-primary-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Siguiente
                                <ArrowRight size={18} className="ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="flex items-center bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-md shadow-green-200 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Completar Registro
                                        <Check size={18} className="ml-2" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
