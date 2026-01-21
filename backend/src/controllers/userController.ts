import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const getUsers = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const userRepo = AppDataSource.getRepository(User);

    select: ['id', 'email', 'name', 'role', 'isActive']

    res.json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});
