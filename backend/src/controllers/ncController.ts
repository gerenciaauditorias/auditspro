import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { NonConformity } from '../models/NonConformity';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const createNC = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, description, source, severity, auditId, dueDate } = req.body;
    const tenantId = (req as any).user.tenantId;

    const ncRepo = AppDataSource.getRepository(NonConformity);

    const nc = ncRepo.create({
        tenantId,
        title,
        description,
        source: source || 'process',
        severity: severity || 'medium',
        auditId,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'open'
    });

    await ncRepo.save(nc);

    res.status(201).json({
        status: 'success',
        data: { nc }
    });
});

export const getNCs = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const ncRepo = AppDataSource.getRepository(NonConformity);

    const ncs = await ncRepo.find({
        where: { tenantId },
        order: { createdAt: 'DESC' }
    });

    res.json({
        status: 'success',
        results: ncs.length,
        data: { ncs }
    });
});

export const updateNC = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { status, rootCauseAnalysis, correctiveActions, closedDate } = req.body;
    const tenantId = (req as any).user.tenantId;
    const ncRepo = AppDataSource.getRepository(NonConformity);

    const nc = await ncRepo.findOne({ where: { id, tenantId } });

    if (!nc) {
        throw new AppError('Non-conformity not found', 404);
    }

    if (status) nc.status = status;
    if (rootCauseAnalysis) nc.rootCauseAnalysis = rootCauseAnalysis;
    if (correctiveActions) nc.correctiveActions = correctiveActions;
    if (closedDate) nc.closedDate = new Date(closedDate);

    await ncRepo.save(nc);

    res.json({
        status: 'success',
        data: { nc }
    });
});
