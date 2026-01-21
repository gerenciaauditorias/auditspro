import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Tenant } from '../models/Tenant';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const getTenantInfo = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const tenantRepo = AppDataSource.getRepository(Tenant);

    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    res.json({
        status: 'success',
        data: { tenant }
    });
});

export const updateTenant = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const {
        companyName,
        industry,
        employeeCount,
        address,
        phone,
        logoUrl,
        cuit,
        taxCondition,
        billingAddress,
        ivaCondition
    } = req.body;

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    // Update fields if provided
    if (companyName) tenant.companyName = companyName;
    if (industry) tenant.industry = industry;
    if (employeeCount) tenant.employeeCount = employeeCount;
    if (address) tenant.address = address;
    if (phone) tenant.phone = phone;
    if (logoUrl) tenant.logoUrl = logoUrl;
    if (cuit) tenant.cuit = cuit;
    if (taxCondition) tenant.taxCondition = taxCondition;
    if (billingAddress) tenant.billingAddress = billingAddress;
    if (ivaCondition) tenant.ivaCondition = ivaCondition;

    await tenantRepo.save(tenant);

    res.json({
        status: 'success',
        data: { tenant }
    });
});
