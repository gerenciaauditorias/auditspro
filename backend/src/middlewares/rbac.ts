import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            throw new AppError('Authentication required', 401);
        }

        if (!allowedRoles.includes(user.role)) {
            throw new AppError('Insufficient permissions', 403);
        }

        next();
    };
};

/**
 * Shorthand middleware for tenant_admin only
 */
export const requireTenantAdmin = requireRole(['tenant_admin']);

/**
 * Middleware for tenant_admin or super_admin
 */
export const requireAdmin = requireRole(['tenant_admin', 'super_admin']);
