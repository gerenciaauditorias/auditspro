import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Tenant } from '../models/Tenant';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const updateOnboarding = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { industry, employeeCount, address, phone, onboardingCompleted } = req.body;
    const tenantId = (req as any).user.tenantId;

    if (!tenantId) {
        throw new AppError('Tenant ID not found', 400);
    }

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    // Update tenant with onboarding data
    if (industry) tenant.industry = industry;
    if (employeeCount) tenant.employeeCount = employeeCount;
    if (address) tenant.address = address;
    if (phone) tenant.phone = phone;
    if (onboardingCompleted !== undefined) tenant.onboardingCompleted = onboardingCompleted;

    await tenantRepo.save(tenant);

    res.json({
        status: 'success',
        data: {
            tenant: {
                id: tenant.id,
                companyName: tenant.companyName,
                industry: tenant.industry,
                employeeCount: tenant.employeeCount,
                address: tenant.address,
                phone: tenant.phone,
                onboardingCompleted: tenant.onboardingCompleted
            }
        }
    });
});

export const getTenantInfo = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;

    if (!tenantId) {
        throw new AppError('Tenant ID not found', 400);
    }

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    res.json({
        status: 'success',
        data: {
            tenant: {
                id: tenant.id,
                companyName: tenant.companyName,
                subdomain: tenant.subdomain,
                planType: tenant.planType,
                status: tenant.status,
                industry: tenant.industry,
                employeeCount: tenant.employeeCount,
                address: tenant.address,
                phone: tenant.phone,
                onboardingCompleted: tenant.onboardingCompleted,
                createdAt: tenant.createdAt
            }
        }
    });
});
