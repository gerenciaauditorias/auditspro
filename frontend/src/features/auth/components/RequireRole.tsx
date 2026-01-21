import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RequireRole: React.FC<Props> = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; // Should be handled by parent usually
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to dashboard or 403 page
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
