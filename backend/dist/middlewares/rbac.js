"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireTenantAdmin = exports.requireRole = void 0;
const errorHandler_1 = require("./errorHandler");
/**
 * Middleware to check if user has required role(s)
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            throw new errorHandler_1.AppError('Authentication required', 401);
        }
        // Super admin has access to everything
        if (user.role === 'super_admin') {
            return next();
        }
        if (!allowedRoles.includes(user.role)) {
            throw new errorHandler_1.AppError('Insufficient permissions', 403);
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Shorthand middleware for tenant_admin or super_admin
 */
exports.requireTenantAdmin = (0, exports.requireRole)(['tenant_admin', 'super_admin']);
/**
 * Middleware for tenant_admin or super_admin
 */
exports.requireAdmin = (0, exports.requireRole)(['tenant_admin', 'super_admin']);
