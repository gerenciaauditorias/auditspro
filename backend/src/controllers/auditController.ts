import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Audit } from '../models/Audit';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const createAudit = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, type, plannedDate, scope, objectives } = req.body;
    const tenantId = (req as any).user.tenantId;

    const auditRepo = AppDataSource.getRepository(Audit);

    const audit = auditRepo.create({
        tenantId,
        title,
        type: type || 'internal',
        plannedDate: new Date(plannedDate),
        scope,
        objectives,
        status: 'scheduled'
    });

    await auditRepo.save(audit);

    res.status(201).json({
        status: 'success',
        data: { audit }
    });
});

export const getAudits = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const auditRepo = AppDataSource.getRepository(Audit);

    const audits = await auditRepo.find({
        where: { tenantId },
        order: { plannedDate: 'DESC' }
    });

    res.json({
        status: 'success',
        results: audits.length,
        data: { audits }
    });
});

export const getAuditById = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;
    const auditRepo = AppDataSource.getRepository(Audit);

    const audit = await auditRepo.findOne({ where: { id, tenantId } });

    if (!audit) {
        throw new AppError('Audit not found', 404);
    }

    res.json({
        status: 'success',
        data: { audit }
    });
});

export const updateAuditStatus = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = (req as any).user.tenantId;
    const auditRepo = AppDataSource.getRepository(Audit);

    const audit = await auditRepo.findOne({ where: { id, tenantId } });

    if (!audit) {
        throw new AppError('Audit not found', 404);
    }

    audit.status = status;
    if (status === 'completed') {
        audit.actualDate = new Date();
    }

    await auditRepo.save(audit);

    res.json({
        status: 'success',
        data: { audit }
    });
});
