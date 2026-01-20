import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Risk } from '../models/Risk';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const createRisk = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { description, probability, impact, mitigationPlan, category } = req.body;
    const tenantId = (req as any).user.tenantId;

    const riskRepo = AppDataSource.getRepository(Risk);

    const risk = riskRepo.create({
        tenantId,
        description,
        probability,
        impact,
        mitigationPlan,
        category,
        status: 'active'
    });

    await riskRepo.save(risk);

    res.status(201).json({
        status: 'success',
        data: { risk }
    });
});

export const getRisks = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const riskRepo = AppDataSource.getRepository(Risk);

    const risks = await riskRepo.find({
        where: { tenantId },
        order: { createdAt: 'DESC' }
    });

    res.json({
        status: 'success',
        results: risks.length,
        data: { risks }
    });
});
