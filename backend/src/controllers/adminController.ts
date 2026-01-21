import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { SystemConfig, ConfigCategory } from '../models/SystemConfig';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { Like, Not } from 'typeorm';
import { Audit } from '../models/Audit';
import { Document } from '../models/Document';
import { NonConformity } from '../models/NonConformity';
import { KPI } from '../models/KPI';

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


export const createTenant = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        companyName,
        subdomain,
        planType,
        adminEmail,
        adminName,
        password
    } = req.body;

    if (!companyName || !subdomain || !planType || !adminEmail || !password) {
        throw new AppError('Missing required fields', 400);
    }

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const userRepo = AppDataSource.getRepository(User);

    const existingTenant = await tenantRepo.findOneBy({ subdomain });
    if (existingTenant) {
        throw new AppError('Subdomain already taken', 400);
    }

    const existingUser = await userRepo.findOneBy({ email: adminEmail });
    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    const tenant = tenantRepo.create({
        companyName,
        subdomain,
        planType,
        status: 'active'
    });

    const savedTenant = await tenantRepo.save(tenant);

    const passwordHash = await User.hashPassword(password);
    const adminUser = userRepo.create({
        tenant: savedTenant,
        email: adminEmail,
        fullName: adminName || 'Admin',
        passwordHash,
        role: 'tenant_admin',
        isActive: true,
        emailVerified: true
    });

    await userRepo.save(adminUser);

    res.status(201).json({
        status: 'success',
        data: {
            tenant: savedTenant,
            admin: {
                id: adminUser.id,
                email: adminUser.email,
                fullName: adminUser.fullName
            }
        }
    });
});

export const updateTenant = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const updateData = req.body;

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOneBy({ id });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    if (updateData.subdomain && updateData.subdomain !== tenant.subdomain) {
        const existing = await tenantRepo.findOneBy({ subdomain: updateData.subdomain });
        if (existing) throw new AppError('Subdomain already taken', 400);
    }

    tenantRepo.merge(tenant, updateData);
    const updatedTenant = await tenantRepo.save(tenant);

    res.json({
        status: 'success',
        data: { tenant: updatedTenant }
    });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, role, search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const userRepo = AppDataSource.getRepository(User);
    const queryBuilder = userRepo.createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .select(['user.id', 'user.fullName', 'user.email', 'user.role', 'user.isActive', 'user.lastLogin', 'user.createdAt', 'tenant.companyName', 'tenant.subdomain']);

    if (tenantId) {
        queryBuilder.andWhere('user.tenantId = :tenantId', { tenantId });
    }

    if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search) {
        queryBuilder.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    const [users, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .orderBy('user.createdAt', 'DESC')
        .getManyAndCount();

    res.json({
        status: 'success',
        results: users.length,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        },
        data: { users }
    });
});

export const getAllAudits = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const auditRepo = AppDataSource.getRepository(Audit);
    const queryBuilder = auditRepo.createQueryBuilder('audit')
        .leftJoinAndSelect('audit.tenant', 'tenant');

    if (tenantId) {
        queryBuilder.andWhere('audit.tenantId = :tenantId', { tenantId });
    }

    if (status) {
        queryBuilder.andWhere('audit.status = :status', { status });
    }

    const [audits, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .orderBy('audit.createdAt', 'DESC')
        .getManyAndCount();

    res.json({
        status: 'success',
        results: audits.length,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        },
        data: { audits }
    });
});

export const getAllDocuments = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, type, search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const docRepo = AppDataSource.getRepository(Document);
    const queryBuilder = docRepo.createQueryBuilder('document')
        .leftJoinAndSelect('document.tenant', 'tenant');

    if (tenantId) {
        queryBuilder.andWhere('document.tenantId = :tenantId', { tenantId });
    }

    if (type) {
        queryBuilder.andWhere('document.type = :type', { type });
    }

    if (search) {
        queryBuilder.andWhere('document.title ILIKE :search', { search: `%${search}%` });
    }

    const [documents, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .orderBy('document.createdAt', 'DESC')
        .getManyAndCount();

    res.json({
        status: 'success',
        results: documents.length,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        },
        data: { documents }
    });
});

export const getAllNCs = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, status, severity, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const ncRepo = AppDataSource.getRepository(NonConformity);
    const queryBuilder = ncRepo.createQueryBuilder('nc')
        .leftJoinAndSelect('nc.tenant', 'tenant')
        .leftJoinAndSelect('nc.audit', 'audit');

    if (tenantId) {
        queryBuilder.andWhere('nc.tenantId = :tenantId', { tenantId });
    }

    if (status) {
        queryBuilder.andWhere('nc.status = :status', { status });
    }

    if (severity) {
        queryBuilder.andWhere('nc.severity = :severity', { severity });
    }

    const [ncs, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .orderBy('nc.createdAt', 'DESC')
        .getManyAndCount();

    res.json({
        status: 'success',
        results: ncs.length,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        },
        data: { ncs }
    });
});

export const getGlobalStats = asyncHandler(async (req: Request, res: Response) => {
    const tenantRepo = AppDataSource.getRepository(Tenant);
    const userRepo = AppDataSource.getRepository(User);
    const auditRepo = AppDataSource.getRepository(Audit);
    const ncRepo = AppDataSource.getRepository(NonConformity);
    const docRepo = AppDataSource.getRepository(Document);

    const [
        totalTenants,
        totalUsers,
        totalAudits,
        activeAudits,
        totalNCs,
        openNCs,
        totalDocs
    ] = await Promise.all([
        tenantRepo.count(),
        userRepo.count(),
        auditRepo.count(),
        auditRepo.count({ where: { status: 'in_progress' } as any }),
        ncRepo.count(),
        ncRepo.count({ where: { status: Not('closed') } as any }),
        docRepo.count()
    ]);

    const auditStatusRaw = await auditRepo.createQueryBuilder('audit')
        .select('audit.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.status')
        .getRawMany();

    const ncSeverityRaw = await ncRepo.createQueryBuilder('nc')
        .select('nc.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('nc.severity')
        .getRawMany();

    res.json({
        status: 'success',
        data: {
            cards: {
                totalTenants,
                totalUsers,
                totalAudits,
                activeAudits,
                totalNCs,
                pendingNCs: openNCs,
                totalDocuments: totalDocs
            },
            charts: {
                auditsByStatus: auditStatusRaw,
                ncsBySeverity: ncSeverityRaw
            }
        }
    });
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
