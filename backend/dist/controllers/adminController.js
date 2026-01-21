"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTenant = exports.testSMTP = exports.updateSystemConfig = exports.getSystemConfig = exports.getAllTenants = void 0;
const database_1 = require("../config/database");
const Tenant_1 = require("../models/Tenant");
const SystemConfig_1 = require("../models/SystemConfig");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.getAllTenants = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantRepo = database_1.AppDataSource.getRepository(Tenant_1.Tenant);
    const tenants = await tenantRepo.createQueryBuilder('tenant')
        .loadRelationCountAndMap('tenant.userCount', 'tenant.users')
        .getMany();
    res.json({
        status: 'success',
        results: tenants.length,
        data: { tenants }
    });
});
exports.getSystemConfig = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { category } = req.query;
    const configRepo = database_1.AppDataSource.getRepository(SystemConfig_1.SystemConfig);
    let query = configRepo.createQueryBuilder('config');
    if (category) {
        query = query.where('config.category = :category', { category });
    }
    const configs = await query.getMany();
    // Mask secret values
    const safeConfigs = configs.map(config => ({
        ...config,
        value: config.isSecret && config.value ? '********' : config.value
    }));
    res.json({
        status: 'success',
        data: { configs: safeConfigs }
    });
});
exports.updateSystemConfig = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { configs } = req.body; // Array of { key, value }
    if (!configs || !Array.isArray(configs)) {
        throw new errorHandler_1.AppError('Invalid configuration data', 400);
    }
    const configRepo = database_1.AppDataSource.getRepository(SystemConfig_1.SystemConfig);
    const updatedConfigs = [];
    for (const item of configs) {
        const config = await configRepo.findOneBy({ key: item.key });
        if (config) {
            // Only update if value is provided and not just the mask
            if (item.value !== '********') {
                config.value = item.value;
                await configRepo.save(config);
                updatedConfigs.push(config);
            }
        }
    }
    res.json({
        status: 'success',
        message: 'Configuration updated successfully'
    });
});
exports.testSMTP = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw new errorHandler_1.AppError('Email is required', 400);
    }
    // Dynamic import to avoid circular dependencies if any, but locally we can import
    const { sendInvitationEmail } = require('../services/emailService');
    try {
        // Send a test email (reusing invitation layout or generic)
        // Ideally we would have a sendTestEmail function, but let's try to verify via a simple transporter verify or sending a real mail
        const nodemailer = require('nodemailer');
        const { SystemConfig } = require('../models/SystemConfig');
        const configRepo = database_1.AppDataSource.getRepository(SystemConfig);
        const configs = await configRepo.find({ where: { category: 'smtp' } });
        const configMap = configs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        const transporter = nodemailer.createTransport({
            host: configMap.smtp_host || process.env.EMAIL_HOST,
            port: parseInt(configMap.smtp_port || process.env.EMAIL_PORT || '587'),
            secure: configMap.smtp_secure === 'true' || process.env.EMAIL_SECURE === 'true',
            auth: {
                user: configMap.smtp_user || process.env.EMAIL_USER,
                pass: configMap.smtp_pass || process.env.EMAIL_PASS,
            },
        });
        await transporter.verify();
        await transporter.sendMail({
            from: configMap.smtp_from || '"Test" <noreply@auditoriasenlinea.com.ar>',
            to: email,
            subject: 'Test SMTP Configuration - Auditorías en Línea',
            text: 'This is a test email to verify your SMTP configuration is working correctly.'
        });
        res.json({
            status: 'success',
            message: 'SMTP connection successful and test email sent'
        });
    }
    catch (error) {
        console.error('SMTP Test Error:', error);
        res.status(500).json({
            status: 'error',
            message: `SMTP Validation Failed: ${error.message}`
        });
    }
});
exports.deleteTenant = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    // Prevent deleting system tenant
    const tenantRepo = database_1.AppDataSource.getRepository(Tenant_1.Tenant);
    const tenant = await tenantRepo.findOneBy({ id });
    if (!tenant) {
        throw new errorHandler_1.AppError('Tenant not found', 404);
    }
    if (tenant.subdomain === 'system') {
        throw new errorHandler_1.AppError('Cannot delete system tenant', 403);
    }
    // Delete tenant (Cascade should handle related resources if configured, otherwise we manual delete)
    // For safety, let's just use remove which respects cascade options in TypeORM entities
    await tenantRepo.remove(tenant);
    res.json({
        status: 'success',
        message: 'Tenant deleted successfully'
    });
});
