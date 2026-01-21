import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendVerificationEmail } from '../services/emailService';
import jwt from 'jsonwebtoken';

export const register = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { companyName, email, password, fullName, planType } = req.body;

    // Validar datos
    if (!companyName || !email || !password || !fullName) {
        throw new AppError('All fields are required', 400);
    }

    // Verificar que el email no existe
    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });

    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    // Crear tenant
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const subdomain = companyName.toLowerCase().replace(/\s+/g, '-');

    const tenant = tenantRepo.create({
        companyName,
        subdomain,
        planType: planType || 'starter'
    });

    await tenantRepo.save(tenant);

    // Crear usuario admin del tenant
    const passwordHash = await User.hashPassword(password);

    const user = userRepo.create({
        tenantId: tenant.id,
        email,
        passwordHash,
        fullName,
        role: 'tenant_admin',
        emailVerified: false
    });

    await userRepo.save(user);

    // Enviar email de verificación
    await sendVerificationEmail(user.email, user.id);

    // Generar tokens
    const accessToken = generateAccessToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });

    res.status(201).json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                tenantId: user.tenantId
            },
            tenant: {
                id: tenant.id,
                companyName: tenant.companyName,
                subdomain: tenant.subdomain,
                planType: tenant.planType
            },
            accessToken,
            refreshToken
        }
    });
});

export const login = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    // Buscar usuario con password
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email })
        .getOne();

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await userRepo.save(user);

    // Generar tokens
    const accessToken = generateAccessToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });

    res.json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                tenantId: user.tenantId
            },
            accessToken,
            refreshToken
        }
    });
});

export const acceptInvite = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token, fullName, password } = req.body;

    if (!token || !fullName || !password) {
        throw new AppError('All fields are required', 400);
    }

    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (err) {
        throw new AppError('Invalid or expired invitation token', 400);
    }

    if (decoded.type !== 'invite') {
        throw new AppError('Invalid token type', 400);
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
        throw new AppError('User already verified', 400);
    }

    user.fullName = fullName;
    user.passwordHash = await User.hashPassword(password);
    user.emailVerified = true;
    user.isActive = true;

    await userRepo.save(user);

    // Generate tokens
    const accessToken = generateAccessToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });

    res.json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                tenantId: user.tenantId
            },
            accessToken,
            refreshToken
        }
    });
});
