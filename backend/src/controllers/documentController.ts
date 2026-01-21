import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { DocumentVersion } from '../models/DocumentVersion';
import { DocumentApproval } from '../models/DocumentApproval';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

export const createDocument = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        title,
        type,
        code,
        content,
        category,
        area,
        description,
        tags,
        confidentialityLevel,
        requiresApproval,
        isCritical,
        appliesToAudits,
        reviewFrequencyMonths,
        responsibleUserId
    } = req.body;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const versionRepo = AppDataSource.getRepository(DocumentVersion);

    // Check if code exists for this tenant
    if (code) {
        const existing = await documentRepo.findOne({ where: { code, tenantId } });
        if (existing) {
            throw new AppError('A document with this code already exists in your organization', 400);
        }
    }

    // Calculate next review date if frequency is provided
    let nextReviewDate = null;
    if (reviewFrequencyMonths) {
        nextReviewDate = new Date();
        nextReviewDate.setMonth(nextReviewDate.getMonth() + reviewFrequencyMonths);
    }

    const document = documentRepo.create({
        tenantId,
        uploadedById: userId,
        fileName: title || 'Untitled',
        originalName: title || 'Untitled',
        mimeType: 'text/html',
        size: content ? content.length : 0,
        storageKey: `docs/${tenantId}/${Date.now()}`,
        type: type || 'other',
        code,
        content,
        status: 'draft',
        version: 1,
        category,
        area,
        description,
        tags: tags || [],
        confidentialityLevel: confidentialityLevel || 'internal',
        requiresApproval: requiresApproval || false,
        isCritical: isCritical || false,
        appliesToAudits: appliesToAudits || false,
        reviewFrequencyMonths,
        nextReviewDate,
        responsibleUserId: responsibleUserId || userId,
        isLatestVersion: true
    });

    await documentRepo.save(document);

    // Create initial version
    const initialVersion = versionRepo.create({
        documentId: document.id,
        version: '1.0',
        content,
        fileUrl: document.storageKey,
        changes: 'Initial version',
        createdById: userId
    });

    await versionRepo.save(initialVersion);

    res.status(201).json({
        status: 'success',
        data: { document }
    });
});

export const getDocuments = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const documentRepo = AppDataSource.getRepository(Document);

    const documents = await documentRepo.find({
        where: { tenantId },
        order: { updatedAt: 'DESC' }
    });

    res.json({
        status: 'success',
        results: documents.length,
        data: { documents }
    });
});

export const getDocumentById = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;
    const documentRepo = AppDataSource.getRepository(Document);

    const document = await documentRepo.findOne({ where: { id, tenantId } });

    if (!document) {
        throw new AppError('Document not found', 404);
    }

    res.json({
        status: 'success',
        data: { document }
    });
});

export const updateDocument = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { title, type, code, content, status } = req.body;
    const tenantId = (req as any).user.tenantId;
    const documentRepo = AppDataSource.getRepository(Document);

    const document = await documentRepo.findOne({ where: { id, tenantId } });

    if (!document) {
        throw new AppError('Document not found', 404);
    }

    if (title) document.fileName = title;
    if (type) document.type = type;
    if (code) document.code = code;
    if (content) document.content = content;
    if (status) document.status = status;

    await documentRepo.save(document);

    res.json({
        status: 'success',
        data: { document }
    });
});

export const requestApproval = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;
    const documentRepo = AppDataSource.getRepository(Document);

    const document = await documentRepo.findOne({ where: { id, tenantId } });

    if (!document) {
        throw new AppError('Document not found', 404);
    }

    document.status = 'under_review';
    await documentRepo.save(document);

    res.json({
        status: 'success',
        data: { document }
    });
});

export const approveDocument = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { comments } = req.body;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const approvalRepo = AppDataSource.getRepository(DocumentApproval);

    const document = await documentRepo.findOne({ where: { id, tenantId } });

    if (!document) {
        throw new AppError('Document not found', 404);
    }

    if (document.status !== 'under_review') {
        throw new AppError('Document is not under review', 400);
    }

    document.status = 'approved';
    document.approvedById = userId;
    document.approvalDate = new Date();
    await documentRepo.save(document);

    // Create approval record
    const approval = approvalRepo.create({
        documentId: id,
        reviewerId: userId,
        status: 'approved',
        comments,
        reviewedAt: new Date()
    });

    await approvalRepo.save(approval);

    res.json({
        status: 'success',
        data: { document, approval }
    });
});

export const rejectDocument = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { comments } = req.body;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const approvalRepo = AppDataSource.getRepository(DocumentApproval);

    if (!comments) {
        throw new AppError('Rejection reason is required', 400);
    }

    const document = await documentRepo.findOne({ where: { id, tenantId } });

    if (!document) {
        throw new AppError('Document not found', 404);
    }

    document.status = 'draft';
    await documentRepo.save(document);

    // Create rejection record
    const approval = approvalRepo.create({
        documentId: id,
        reviewerId: userId,
        status: 'rejected',
        comments,
        reviewedAt: new Date()
    });

    await approvalRepo.save(approval);

    res.json({
        status: 'success',
        data: { document, approval }
    });
});
