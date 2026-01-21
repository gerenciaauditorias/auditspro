"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteUser = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Tenant_1 = require("../models/Tenant");
const errorHandler_1 = require("../middlewares/errorHandler");
const emailService_1 = require("../services/emailService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.getUsers = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
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
exports.createUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, fullName, role, password } = req.body;
    const tenantId = req.user.tenantId;
    if (!email || !fullName || !role) {
        throw new errorHandler_1.AppError('Email, fullName, and role are required', 400);
    }
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
        throw new errorHandler_1.AppError('User with this email already exists', 400);
    }
    const user = userRepo.create({
        email,
        fullName,
        role,
        tenantId,
        passwordHash: password ? await User_1.User.hashPassword(password) : await User_1.User.hashPassword(`temp_${Date.now()}`),
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
exports.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { fullName, role, isActive } = req.body;
    const tenantId = req.user.tenantId;
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOne({ where: { id, tenantId } });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    if (fullName)
        user.fullName = fullName;
    if (role)
        user.role = role;
    if (typeof isActive === 'boolean')
        user.isActive = isActive;
    await userRepo.save(user);
    res.json({
        status: 'success',
        data: { user }
    });
});
exports.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOne({ where: { id, tenantId } });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Soft delete - set isActive to false
    user.isActive = false;
    await userRepo.save(user);
    res.json({
        status: 'success',
        message: 'User deactivated successfully'
    });
});
exports.inviteUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, role } = req.body;
    const tenantId = req.user.tenantId;
    if (!email || !role) {
        throw new errorHandler_1.AppError('Email and role are required', 400);
    }
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
        if (existingUser.tenantId === tenantId) {
            throw new errorHandler_1.AppError('User already exists in this organization', 400);
        }
        else {
            throw new errorHandler_1.AppError('User already belongs to another organization', 400);
        }
    }
    const tenantRepo = database_1.AppDataSource.getRepository(Tenant_1.Tenant);
    const tenant = await tenantRepo.findOneBy({ id: tenantId });
    if (!tenant)
        throw new errorHandler_1.AppError('Tenant not found', 404);
    const user = userRepo.create({
        email,
        role,
        tenantId,
        fullName: 'Pending Invite',
        passwordHash: await User_1.User.hashPassword(`invite_${Date.now()}`),
        isActive: true,
        emailVerified: false
    });
    await userRepo.save(user);
    const inviteToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'invite' }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
    await (0, emailService_1.sendInvitationEmail)(email, inviteToken, tenant.companyName);
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
