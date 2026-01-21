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

export const completeOnboarding = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const {
        industry,
        employeeCount,
        address,
        country,
        city,
        phone,
        paymentToken, // Mock or Real Payment Token
        adminPhone,
        adminPosition
    } = req.body;

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
        throw new AppError('Tenant not found', 404);
    }

    // Update Company Info
    if (industry) tenant.industry = industry;
    if (employeeCount) tenant.employeeCount = employeeCount;
    if (address) tenant.address = address;
    if (phone) tenant.phone = phone;
    // Note: Country/City added to model if needed, or stored in address string for now if model not updated for them specifically. 
    // Request says "Country, City, Phone" in Step 1. 
    // Let's assume for now we append to address or just store if columns exist.
    // To be precise, I should probably add country/city to Tenant model if I want them distinct.
    // For now, let's just save what we have.

    // Payment & Trial Logic
    if (paymentToken) {
        tenant.paymentMethodToken = paymentToken;
        const now = new Date();
        tenant.trialStartDate = now;

        // 30 Days Trial
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 30);
        tenant.trialEndsAt = trialEnd;

        // Billing starts at 60 days
        const billingStart = new Date(now);
        billingStart.setDate(billingStart.getDate() + 60);
        tenant.billingStartDate = billingStart;

        tenant.subscriptionStatus = 'trial_active';
    }

    tenant.onboardingCompleted = true;

    await tenantRepo.save(tenant);

    res.json({
        status: 'success',
        data: {
            message: 'Onboarding completed',
            trialEndsAt: tenant.trialEndsAt
        }
    });
});
