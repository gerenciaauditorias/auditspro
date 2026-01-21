import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { SystemConfig, ConfigCategory } from '../models/SystemConfig';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const getAllTenants = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantRepo = AppDataSource.getRepository(Tenant);

    const tenants = await tenantRepo.createQueryBuilder('tenant')
        .loadRelationCountAndMap('tenant.userCount', 'tenant.users')
        .getMany();

    res.json({
        status: 'success',
        results: tenants.length,
        data: { tenants }
    });
});

export const getSystemConfig = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { category } = req.query;
    const configRepo = AppDataSource.getRepository(SystemConfig);

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

export const updateSystemConfig = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { configs } = req.body; // Array of { key, value }

    if (!configs || !Array.isArray(configs)) {
        throw new AppError('Invalid configuration data', 400);
    }

    const configRepo = AppDataSource.getRepository(SystemConfig);
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

export const testSMTP = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError('Email is required', 400);
    }

    // Dynamic import to avoid circular dependencies if any, but locally we can import
    const { sendInvitationEmail } = require('../services/emailService');

    try {
        // Send a test email (reusing invitation layout or generic)
        // Ideally we would have a sendTestEmail function, but let's try to verify via a simple transporter verify or sending a real mail
        const nodemailer = require('nodemailer');
        const { SystemConfig } = require('../models/SystemConfig');
        const configRepo = AppDataSource.getRepository(SystemConfig);
        const configs = await configRepo.find({ where: { category: 'smtp' } });

        const configMap = configs.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

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
    } catch (error: any) {
        console.error('SMTP Test Error:', error);
        res.status(500).json({
            status: 'error',
            message: `SMTP Validation Failed: ${error.message}`
        });
    }
});

export const deleteTenant = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    // Prevent deleting system tenant
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOneBy({ id });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    if (tenant.subdomain === 'system') {
        throw new AppError('Cannot delete system tenant', 403);
    }

    // Delete tenant (Cascade should handle related resources if configured, otherwise we manual delete)
    // For safety, let's just use remove which respects cascade options in TypeORM entities
    await tenantRepo.remove(tenant);

    res.json({
        status: 'success',
        message: 'Tenant deleted successfully'
    });
});
