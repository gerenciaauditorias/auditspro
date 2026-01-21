"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureTenantIsolation = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("./errorHandler");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token, process.env.JWT_SECRET);
        // Verificar que el usuario existe y está activo
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({
            where: { id: decoded.userId, isActive: true }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found or inactive', 401);
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.AppError('Invalid token', 401));
        }
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Unauthorized', 401));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Insufficient permissions', 403));
        }
        next();
    };
};
exports.authorize = authorize;
// Middleware para asegurar aislamiento de tenant
const ensureTenantIsolation = (req, res, next) => {
    if (req.user) {
        // Agregar tenantId a todas las queries/operations mediante body/query si es necesario
        req.body.tenantId = req.user.tenantId;
        req.query.tenantId = req.user.tenantId;
    }
    next();
};
exports.ensureTenantIsolation = ensureTenantIsolation;
