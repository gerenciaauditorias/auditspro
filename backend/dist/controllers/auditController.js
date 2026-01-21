"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChecklistItem = exports.updateAuditStatus = exports.getAuditById = exports.getAudits = exports.createAudit = void 0;
const database_1 = require("../config/database");
const Audit_1 = require("../models/Audit");
const User_1 = require("../models/User");
const AuditChecklist_1 = require("../models/AuditChecklist");
const errorHandler_1 = require("../middlewares/errorHandler");
const typeorm_1 = require("typeorm");
const templates_1 = require("../constants/templates");
exports.createAudit = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { title, type, plannedDate, scope, objectives, isoStandard, startDate, endDate, responsibleIds, populateFromStandard, auditorId } = req.body;
    const tenantId = req.user.tenantId;
    const auditRepo = database_1.AppDataSource.getRepository(Audit_1.Audit);
    const userRepo = database_1.AppDataSource.getRepository(User_1.User);
    const checklistRepo = database_1.AppDataSource.getRepository(AuditChecklist_1.AuditChecklist);
    // Find responsibles if provided
    let responsibles = [];
    if (responsibleIds && responsibleIds.length > 0) {
        responsibles = await userRepo.find({
            where: {
                id: (0, typeorm_1.In)(responsibleIds),
                tenantId
            }
        });
    }
    // Find lead auditor if provided
    const leadAuditor = auditorId ? await userRepo.findOne({ where: { id: auditorId, tenantId } }) : null;
    const audit = auditRepo.create({
        tenantId,
        title,
        type: type || 'internal',
        plannedDate: new Date(plannedDate),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        scope,
        objectives,
        isoStandard,
        status: 'scheduled',
        leadAuditor: leadAuditor || undefined,
        responsibles
    });
    const savedAudit = await auditRepo.save(audit);
    // Populate checklist if requested
    if (populateFromStandard && isoStandard === 'ISO 9001') {
        const checklists = templates_1.ISO_9001_CHECKS.map(check => checklistRepo.create({
            auditId: savedAudit.id,
            section: check.section,
            question: check.question
        }));
        await checklistRepo.save(checklists);
    }
    res.status(201).json({
        status: 'success',
        data: { audit: savedAudit }
    });
});
exports.getAudits = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const auditRepo = database_1.AppDataSource.getRepository(Audit_1.Audit);
    const audits = await auditRepo.find({
        where: { tenantId },
        order: { plannedDate: 'DESC' },
        relations: ['leadAuditor']
    });
    res.json({
        status: 'success',
        results: audits.length,
        data: { audits }
    });
});
exports.getAuditById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const auditRepo = database_1.AppDataSource.getRepository(Audit_1.Audit);
    const audit = await auditRepo.findOne({
        where: { id, tenantId },
        relations: ['leadAuditor', 'responsibles', 'checklists']
    });
    if (!audit) {
        throw new errorHandler_1.AppError('Audit not found', 404);
    }
    // Sort checklists by section
    if (audit.checklists) {
        audit.checklists.sort((a, b) => a.section.localeCompare(b.section, undefined, { numeric: true }));
    }
    res.json({
        status: 'success',
        data: { audit }
    });
});
exports.updateAuditStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.user.tenantId;
    const auditRepo = database_1.AppDataSource.getRepository(Audit_1.Audit);
    const audit = await auditRepo.findOne({ where: { id, tenantId } });
    if (!audit) {
        throw new errorHandler_1.AppError('Audit not found', 404);
    }
    audit.status = status;
    if (status === 'in_progress' && !audit.startDate) {
        audit.startDate = new Date();
    }
    if (status === 'completed') {
        audit.endDate = new Date();
        audit.actualDate = new Date(); // Legacy support
    }
    await auditRepo.save(audit);
    res.json({
        status: 'success',
        data: { audit }
    });
});
exports.updateChecklistItem = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { auditId, checklistId } = req.params;
    const { status, auditorNotes, evidence } = req.body;
    const tenantId = req.user.tenantId;
    const checklistRepo = database_1.AppDataSource.getRepository(AuditChecklist_1.AuditChecklist);
    const item = await checklistRepo.findOne({
        where: { id: checklistId },
        relations: ['audit']
    });
    if (!item) {
        throw new errorHandler_1.AppError('Checklist item not found', 404);
    }
    if (item.audit.tenantId !== tenantId) {
        throw new errorHandler_1.AppError('Not authorized', 403);
    }
    // Update fields if provided
    if (status !== undefined)
        item.status = status;
    if (auditorNotes !== undefined)
        item.auditorNotes = auditorNotes;
    if (evidence !== undefined)
        item.evidence = evidence;
    await checklistRepo.save(item);
    res.json({
        status: 'success',
        data: { item }
    });
});
