import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Audit } from '../models/Audit';
import { User } from '../models/User';
import { AuditChecklist } from '../models/AuditChecklist';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { In } from 'typeorm';
import { ISO_9001_CHECKS } from '../constants/templates';

export const createAudit = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, type, plannedDate, scope, objectives, isoStandard, startDate, endDate, responsibleIds, populateFromStandard, auditorId } = req.body;
    const tenantId = (req as any).user.tenantId;

    const auditRepo = AppDataSource.getRepository(Audit);
    const userRepo = AppDataSource.getRepository(User);
    const checklistRepo = AppDataSource.getRepository(AuditChecklist);

    // Find responsibles if provided
    let responsibles: User[] = [];
    if (responsibleIds && responsibleIds.length > 0) {
        responsibles = await userRepo.find({
            where: {
                id: In(responsibleIds),
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
        const checklists = ISO_9001_CHECKS.map(check => checklistRepo.create({
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

export const getAudits = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const auditRepo = AppDataSource.getRepository(Audit);

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

export const getAuditById = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;
    const auditRepo = AppDataSource.getRepository(Audit);

    const audit = await auditRepo.findOne({
        where: { id, tenantId },
        relations: ['leadAuditor', 'responsibles', 'checklists']
    });

    if (!audit) {
        throw new AppError('Audit not found', 404);
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
