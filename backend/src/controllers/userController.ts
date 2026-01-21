import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { sendInvitationEmail } from '../services/emailService';
import jwt from 'jsonwebtoken';

export const getUsers = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const userRepo = AppDataSource.getRepository(User);

    const users = await userRepo.find({
        where: { tenantId },
        select: ['id', 'email', 'fullName', 'role', 'isActive', 'emailVerified', 'createdAt', 'lastLogin']
    });

    res.json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});

export const createUser = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, fullName, role, password } = req.body;
    const tenantId = (req as any).user.tenantId;

    if (!email || !fullName || !role) {
        throw new AppError('Email, fullName, and role are required', 400);
    }

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });

    if (existingUser) {
        throw new AppError('User with this email already exists', 400);
    }

    const user = userRepo.create({
        email,
        fullName,
        role,
        tenantId,
        passwordHash: password ? await User.hashPassword(password) : await User.hashPassword(`temp_${Date.now()}`),
        isActive: true,
        emailVerified: false
    });

    await userRepo.save(user);

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        }
    });
});

export const updateUser = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { fullName, role, isActive } = req.body;
    const tenantId = (req as any).user.tenantId;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id, tenantId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await userRepo.save(user);

    res.json({
        status: 'success',
        data: { user }
    });
});

export const deleteUser = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id, tenantId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await userRepo.save(user);

    res.json({
        status: 'success',
        message: 'User deactivated successfully'
    });
});

export const inviteUser = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, role } = req.body;
    const tenantId = (req as any).user.tenantId;

    if (!email || !role) {
        throw new AppError('Email and role are required', 400);
    }

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });

    if (existingUser) {
        if (existingUser.tenantId === tenantId) {
            throw new AppError('User already exists in this organization', 400);
        } else {
            throw new AppError('User already belongs to another organization', 400);
        }
    }

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOneBy({ id: tenantId });
    if (!tenant) throw new AppError('Tenant not found', 404);

    const user = userRepo.create({
        email,
        role,
        tenantId,
        fullName: 'Pending Invite',
        passwordHash: await User.hashPassword(`invite_${Date.now()}`),
        isActive: true,
        emailVerified: false
    });

    await userRepo.save(user);

    const inviteToken = jwt.sign(
        { userId: user.id, type: 'invite' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
    );

    await sendInvitationEmail(email, inviteToken, tenant.companyName);

    res.status(201).json({
        status: 'success',
        message: 'Invitation sent successfully',
        data: {
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        }
    });
});
