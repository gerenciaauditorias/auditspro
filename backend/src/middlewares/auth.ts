import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        tenantId: string;
        email: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token, process.env.JWT_SECRET!);

        // Verificar que el usuario existe y está activo
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: decoded.userId, isActive: true }
        });

        if (!user) {
            throw new AppError('User not found or inactive', 401);
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token', 401));
        }
        next(error);
    }
};

export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        next();
    };
};

// Middleware para asegurar aislamiento de tenant
export const ensureTenantIsolation = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.user) {
        // Agregar tenantId a todas las queries/operations mediante body/query si es necesario
        req.body.tenantId = req.user.tenantId;
        req.query.tenantId = req.user.tenantId;
    }
    next();
};
