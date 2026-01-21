"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenant = exports.getTenantInfo = void 0;
const database_1 = require("../config/database");
const Tenant_1 = require("../models/Tenant");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.getTenantInfo = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const tenantRepo = database_1.AppDataSource.getRepository(Tenant_1.Tenant);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
        throw new errorHandler_1.AppError('Tenant not found', 404);
    }
    res.json({
        status: 'success',
        data: { tenant }
    });
});
exports.updateTenant = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const { companyName, industry, employeeCount, address, phone, logoUrl, cuit, taxCondition, billingAddress, ivaCondition } = req.body;
    const tenantRepo = database_1.AppDataSource.getRepository(Tenant_1.Tenant);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
        throw new errorHandler_1.AppError('Tenant not found', 404);
    }
    // Update fields if provided
    if (companyName)
        tenant.companyName = companyName;
    if (industry)
        tenant.industry = industry;
    if (employeeCount)
        tenant.employeeCount = employeeCount;
    if (address)
        tenant.address = address;
    if (phone)
        tenant.phone = phone;
    if (logoUrl)
        tenant.logoUrl = logoUrl;
    if (cuit)
        tenant.cuit = cuit;
    if (taxCondition)
        tenant.taxCondition = taxCondition;
    if (billingAddress)
        tenant.billingAddress = billingAddress;
    if (ivaCondition)
        tenant.ivaCondition = ivaCondition;
    await tenantRepo.save(tenant);
    res.json({
        status: 'success',
        data: { tenant }
    });
});
