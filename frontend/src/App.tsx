import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import OnboardingWizard from './pages/OnboardingWizard';
import Audits from './pages/Audits';
import { AuditDetails } from './pages/AuditDetails';
import NonConformities from './pages/NonConformities';
import KPIs from './pages/KPIs';
import Risks from './pages/Risks';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute>
                                <OnboardingWizard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/documents"
                        element={
                            <ProtectedRoute>
                                <Documents />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings/*"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/audits"
                        element={
                            <ProtectedRoute>
                                <Audits />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/audits/:id"
                        element={
                            <ProtectedRoute>
                                <AuditDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ncs"
                        element={
                            <ProtectedRoute>
                                <NonConformities />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/kpis"
                        element={
                            <ProtectedRoute>
                                <KPIs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/risks"
                        element={
                            <ProtectedRoute>
                                <Risks />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
