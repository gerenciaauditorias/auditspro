"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNC = exports.getNCs = exports.createNC = void 0;
const database_1 = require("../config/database");
const NonConformity_1 = require("../models/NonConformity");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.createNC = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { title, description, source, severity, auditId, dueDate } = req.body;
    const tenantId = req.user.tenantId;
    const ncRepo = database_1.AppDataSource.getRepository(NonConformity_1.NonConformity);
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
exports.getNCs = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const ncRepo = database_1.AppDataSource.getRepository(NonConformity_1.NonConformity);
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
exports.updateNC = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { status, rootCauseAnalysis, correctiveActions, closedDate } = req.body;
    const tenantId = req.user.tenantId;
    const ncRepo = database_1.AppDataSource.getRepository(NonConformity_1.NonConformity);
    const nc = await ncRepo.findOne({ where: { id, tenantId } });
    if (!nc) {
        throw new errorHandler_1.AppError('Non-conformity not found', 404);
    }
    if (status)
        nc.status = status;
    if (rootCauseAnalysis)
        nc.rootCauseAnalysis = rootCauseAnalysis;
    if (correctiveActions)
        nc.correctiveActions = correctiveActions;
    if (closedDate)
        nc.closedDate = new Date(closedDate);
    await ncRepo.save(nc);
    res.json({
        status: 'success',
        data: { nc }
    });
});
