import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { DocumentVersion } from '../models/DocumentVersion';
import { DocumentPermission } from '../models/DocumentPermission';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { Like, In } from 'typeorm';

// Get document versions
export const getDocumentVersions = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    const documentRepo = AppDataSource.getRepository(Document);
    const versionRepo = AppDataSource.getRepository(DocumentVersion);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const versions = await versionRepo.find({
        where: { documentId: id },
        order: { createdAt: 'DESC' },
        relations: ['createdBy']
    });

    res.json({
        status: 'success',
        results: versions.length,
        data: { versions }
    });
});

// Search documents with advanced filters
export const searchDocuments = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;
    const {
        search,
        status,
        type,
        category,
        confidentialityLevel,
        tags,
        isCritical,
        appliesToAudits,
        responsibleUserId,
        page = 1,
        limit = 20
    } = req.query;

    const documentRepo = AppDataSource.getRepository(Document);
    const queryBuilder = documentRepo.createQueryBuilder('doc')
        .where('doc.tenantId = :tenantId', { tenantId })
        .leftJoinAndSelect('doc.responsibleUser', 'responsible')
        .leftJoinAndSelect('doc.uploadedBy', 'uploader');

    // Search by name or code
    if (search) {
        queryBuilder.andWhere(
            '(doc.fileName ILIKE :search OR doc.code ILIKE :search OR doc.description ILIKE :search)',
            { search: `%${search}%` }
        );
    }

    // Filter by status
    if (status) {
        queryBuilder.andWhere('doc.status = :status', { status });
    }

    // Filter by type
    if (type) {
        queryBuilder.andWhere('doc.type = :type', { type });
    }

    // Filter by category
    if (category) {
        queryBuilder.andWhere('doc.category = :category', { category });
    }

    // Filter by confidentiality
    if (confidentialityLevel) {
        queryBuilder.andWhere('doc.confidentialityLevel = :confidentialityLevel', { confidentialityLevel });
    }

    // Filter by critical status
    if (isCritical !== undefined) {
        queryBuilder.andWhere('doc.isCritical = :isCritical', { isCritical: isCritical === 'true' });
    }

    // Filter by audit applicability
    if (appliesToAudits !== undefined) {
        queryBuilder.andWhere('doc.appliesToAudits = :appliesToAudits', { appliesToAudits: appliesToAudits === 'true' });
    }

    // Filter by responsible user
    if (responsibleUserId) {
        queryBuilder.andWhere('doc.responsibleUserId = :responsibleUserId', { responsibleUserId });
    }

    // Filter by tags (if provided as comma-separated string)
    if (tags) {
        const tagArray = (tags as string).split(',');
        queryBuilder.andWhere('doc.tags && ARRAY[:...tags]::text[]', { tags: tagArray });
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const [documents, total] = await queryBuilder
        .skip(skip)
        .take(Number(limit))
        .orderBy('doc.updatedAt', 'DESC')
        .getManyAndCount();

    res.json({
        status: 'success',
        results: documents.length,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        },
        data: { documents }
    });
});

// Grant permission to user
export const grantPermission = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { userId, permission } = req.body;
    const tenantId = (req as any).user.tenantId;
    const grantedById = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const permissionRepo = AppDataSource.getRepository(DocumentPermission);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    // Check if permission already exists
    const existing = await permissionRepo.findOne({
        where: { documentId: id, userId }
    });

    if (existing) {
        // Update existing permission
        existing.permission = permission;
        await permissionRepo.save(existing);

        res.json({
            status: 'success',
            data: { permission: existing }
        });
    } else {
        // Create new permission
        const newPermission = permissionRepo.create({
            documentId: id,
            userId,
            permission,
            grantedById
        });

        await permissionRepo.save(newPermission);

        res.status(201).json({
            status: 'success',
            data: { permission: newPermission }
        });
    }
});

// Get document permissions
export const getDocumentPermissions = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    const documentRepo = AppDataSource.getRepository(Document);
    const permissionRepo = AppDataSource.getRepository(DocumentPermission);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const permissions = await permissionRepo.find({
        where: { documentId: id },
        relations: ['user', 'grantedBy']
    });

    res.json({
        status: 'success',
        results: permissions.length,
        data: { permissions }
    });
});

// Revoke permission
export const revokePermission = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id, permissionId } = req.params;
    const tenantId = (req as any).user.tenantId;

    const documentRepo = AppDataSource.getRepository(Document);
    const permissionRepo = AppDataSource.getRepository(DocumentPermission);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const permission = await permissionRepo.findOne({
        where: { id: permissionId, documentId: id }
    });

    if (!permission) {
        throw new AppError('Permission not found', 404);
    }

    await permissionRepo.remove(permission);

    res.json({
        status: 'success',
        message: 'Permission revoked successfully'
    });
});

// Get document matrix (all documents with key info)
export const getDocumentMatrix = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantId = (req as any).user.tenantId;

    const documentRepo = AppDataSource.getRepository(Document);

    const documents = await documentRepo.find({
        where: { tenantId },
        relations: ['responsibleUser'],
        order: { code: 'ASC' }
    });

    // Format for matrix view
    const matrix = documents.map(doc => ({
        id: doc.id,
        code: doc.code,
        fileName: doc.fileName,
        type: doc.type,
        version: doc.version,
        status: doc.status,
        category: doc.category,
        responsibleUser: doc.responsibleUser?.fullName || 'N/A',
        confidentialityLevel: doc.confidentialityLevel,
        isCritical: doc.isCritical,
        nextReviewDate: doc.nextReviewDate,
        updatedAt: doc.updatedAt,
        isExpired: doc.nextReviewDate ? new Date(doc.nextReviewDate) < new Date() : false
    }));

    res.json({
        status: 'success',
        results: matrix.length,
        data: { matrix }
    });
});
