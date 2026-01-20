import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { KPI } from '../models/KPI';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const createKPI = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, category, unit, targetValue, direction, frequency } = req.body;
    const tenantId = (req as any).user.tenantId;

    const kpiRepo = AppDataSource.getRepository(KPI);

    const kpi = kpiRepo.create({
        tenantId,
        name,
        category: category || 'quality',
        unit,
        targetValue,
        direction: direction || 'higher',
        frequency: frequency || 'monthly',
        measurements: []
    });

    await kpiRepo.save(kpi);

    res.status(201).json({
        status: 'success',
        data: { kpi }
    });
});

export const getKPIs = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const kpiRepo = AppDataSource.getRepository(KPI);

    const kpis = await kpiRepo.find({
        where: { tenantId },
        order: { name: 'ASC' }
    });

    res.json({
        status: 'success',
        results: kpis.length,
        data: { kpis }
    });
});

export const addMeasurement = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { date, value } = req.body;
    const tenantId = (req as any).user.tenantId;
    const kpiRepo = AppDataSource.getRepository(KPI);

    const kpi = await kpiRepo.findOne({ where: { id, tenantId } });

    if (!kpi) {
        throw new AppError('KPI not found', 404);
    }

    if (!kpi.measurements) kpi.measurements = [];
    kpi.measurements.push({ date, value });

    await kpiRepo.save(kpi);

    res.json({
        status: 'success',
        data: { kpi }
    });
});
