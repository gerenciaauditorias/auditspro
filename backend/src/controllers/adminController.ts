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
