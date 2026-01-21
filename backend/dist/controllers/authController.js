"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInvite = exports.login = exports.register = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Tenant_1 = require("../models/Tenant");
const errorHandler_1 = require("../middlewares/errorHandler");
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("../services/emailService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { companyName, email, password, fullName, planType } = req.body;
    // Validar datos
    if (!companyName || !email || !password || !fullName) {
        throw new errorHandler_1.AppError('All fields are required', 400);
    }
    // Verificar que el email no existe
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
        throw new errorHandler_1.AppError('Email already registered', 400);
    }
    // Crear tenant
    const tenantRepo = database_1.AppDataSource.getRepository(Tenant_1.Tenant);
    const subdomain = companyName.toLowerCase().replace(/\s+/g, '-');
    const tenant = tenantRepo.create({
        companyName,
        subdomain,
        planType: planType || 'starter'
    });
    await tenantRepo.save(tenant);
    // Crear usuario admin del tenant
    const passwordHash = await User_1.User.hashPassword(password);
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
    await (0, emailService_1.sendVerificationEmail)(user.email, user.id);
    // Generar tokens
    const accessToken = (0, jwt_1.generateAccessToken)({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });
    const refreshToken = (0, jwt_1.generateRefreshToken)({
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
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errorHandler_1.AppError('Email and password are required', 400);
    }
    // Buscar usuario con password
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email })
        .getOne();
    if (!user || !(await user.comparePassword(password))) {
        throw new errorHandler_1.AppError('Invalid credentials', 401);
    }
    if (!user.isActive) {
        throw new errorHandler_1.AppError('Account is deactivated', 403);
    }
    // Actualizar último login
    user.lastLogin = new Date();
    await userRepo.save(user);
    // Generar tokens
    const accessToken = (0, jwt_1.generateAccessToken)({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });
    const refreshToken = (0, jwt_1.generateRefreshToken)({
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
exports.acceptInvite = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { token, fullName, password } = req.body;
    if (!token || !fullName || !password) {
        throw new errorHandler_1.AppError('All fields are required', 400);
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
    }
    catch (err) {
        throw new errorHandler_1.AppError('Invalid or expired invitation token', 400);
    }
    if (decoded.type !== 'invite') {
        throw new errorHandler_1.AppError('Invalid token type', 400);
    }
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    if (user.emailVerified) {
        throw new errorHandler_1.AppError('User already verified', 400);
    }
    user.fullName = fullName;
    user.passwordHash = await User_1.User.hashPassword(password);
    user.emailVerified = true;
    user.isActive = true;
    await userRepo.save(user);
    // Generate tokens
    const accessToken = (0, jwt_1.generateAccessToken)({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
    });
    const refreshToken = (0, jwt_1.generateRefreshToken)({
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
