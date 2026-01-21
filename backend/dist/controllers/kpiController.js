"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMeasurement = exports.getKPIs = exports.createKPI = void 0;
const database_1 = require("../config/database");
const KPI_1 = require("../models/KPI");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.createKPI = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, category, unit, targetValue, direction, frequency } = req.body;
    const tenantId = req.user.tenantId;
    const kpiRepo = database_1.AppDataSource.getRepository(KPI_1.KPI);
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
exports.getKPIs = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const kpiRepo = database_1.AppDataSource.getRepository(KPI_1.KPI);
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
exports.addMeasurement = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { date, value } = req.body;
    const tenantId = req.user.tenantId;
    const kpiRepo = database_1.AppDataSource.getRepository(KPI_1.KPI);
    const kpi = await kpiRepo.findOne({ where: { id, tenantId } });
    if (!kpi) {
        throw new errorHandler_1.AppError('KPI not found', 404);
    }
    if (!kpi.measurements)
        kpi.measurements = [];
    kpi.measurements.push({ date, value });
    await kpiRepo.save(kpi);
    res.json({
        status: 'success',
        data: { kpi }
    });
});
