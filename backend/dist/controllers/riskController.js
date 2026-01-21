"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRisks = exports.createRisk = void 0;
const database_1 = require("../config/database");
const Risk_1 = require("../models/Risk");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.createRisk = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { description, probability, impact, mitigationPlan, category } = req.body;
    const tenantId = req.user.tenantId;
    const riskRepo = database_1.AppDataSource.getRepository(Risk_1.Risk);
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
exports.getRisks = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const riskRepo = database_1.AppDataSource.getRepository(Risk_1.Risk);
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
