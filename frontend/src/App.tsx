import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import OnboardingWizard from './pages/OnboardingWizard';
import Audits from './pages/Audits';
import { AuditDetails } from './pages/AuditDetails';
import AcceptInvite from './pages/AcceptInvite';
import NonConformities from './pages/NonConformities';
import KPIs from './pages/KPIs';
import Risks from './pages/Risks';

import { RequireRole } from './features/auth/components/RequireRole';
import { AdminLayout } from './features/admin/layouts/AdminLayout';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { TenantList } from './features/admin/components/TenantList';
import { GlobalUsers } from './features/admin/pages/GlobalUsers';
import { GlobalAudits } from './features/admin/pages/GlobalAudits';
import { GlobalDocuments } from './features/admin/pages/GlobalDocuments';
import { GlobalNCs } from './features/admin/pages/GlobalNCs';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <RequireRole allowedRoles={['super_admin']}>
                                <AdminLayout>
                                    {/* Outlet mechanism is not standard in Layout unless it renders Outlet. 
                                         Our AdminLayout renders {children}.
                                         React Router v6 nested routes usually use <Outlet/> in layout.
                                         Button AdminLayout takes children. 
                                         So we can't use nested Route syntax *with* AdminLayout as the element unless AdminLayout renders Outlet.
                                         
                                         Let's adjust AdminLayout to use Outlet or wrap each page.
                                         The current AdminLayout takes children.
                                         So, we should probably do:
                                         <Route path="/admin" element={<ProtectedRoute><RequireRole...><AdminLayout><Outlet/></AdminLayout></...>} >
                                         
                                         But AdminLayout expects children currently.
                                         Let's modify AdminLayout to use Outlet? Or just pass Outlet as child.
                                         
                                         Simpler approach for now without modifying AdminLayout interface:
                                      */}
                                    <Outlet />
                                </AdminLayout>
                            </RequireRole>
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="tenants" element={<TenantList />} />
                        <Route path="users" element={<GlobalUsers />} />
                        <Route path="audits" element={<GlobalAudits />} />
                        <Route path="documents" element={<GlobalDocuments />} />
                        <Route path="ncs" element={<GlobalNCs />} />
                    </Route>

                    {/* Standard App Routes */}
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
                        path="/documents/:id"
                        element={
                            <ProtectedRoute>
                                <DocumentDetail />
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
