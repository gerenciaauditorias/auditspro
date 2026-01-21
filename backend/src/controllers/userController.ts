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
        select: ['id', 'email', 'fullName', 'role', 'isActive']
    });

    res.json({
        status: 'success',
        results: users.length,
        data: { users }
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

    // Create user with temp password and unverified email
    // We set isActive to true so they can try to login/reset password, 
    // but typically we might want false until they accept. 
    // Plan said isActive: true.
    const user = userRepo.create({
        email,
        role,
        tenantId,
        fullName: 'Pending Invite',
        passwordHash: await User.hashPassword(`invite_${Date.now()}`), // Temp random password
        isActive: true, // As per plan
        emailVerified: false
    });

    await userRepo.save(user);

    // Generate invite token
    // We can use a specific secret or the general JWT_SECRET
    const inviteToken = jwt.sign(
        { userId: user.id, type: 'invite' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
    );

    // Send email
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
