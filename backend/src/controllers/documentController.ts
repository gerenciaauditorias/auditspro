import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { AuthRequest } from '../middlewares/auth';
import { storageService } from '../services/storageService';
import { AppError, asyncHandler } from '../middlewares/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export const uploadDocument = asyncHandler(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        throw new AppError('No file provided', 400);
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const fileName = `${uuidv4()}-${originalname}`;
    const storageKey = `${req.user?.tenantId}/documents/${fileName}`;

    // Subir a MinIO
    await storageService.uploadFile(storageKey, buffer, mimetype);

    // Guardar metadata en BD
    const documentRepo = AppDataSource.getRepository(Document);
    const document = documentRepo.create({
        tenantId: req.user?.tenantId!,
        uploadedById: req.user?.userId!,
        fileName,
        originalName: originalname,
        mimeType: mimetype,
        size,
        storageKey,
        status: 'pending'
    });

    await documentRepo.save(document);

    res.status(201).json({
        status: 'success',
        data: {
            document
        }
    });
});

export const getDocuments = asyncHandler(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const documentRepo = AppDataSource.getRepository(Document);
    const documents = await documentRepo.find({
        where: { tenantId: req.user?.tenantId },
        order: { createdAt: 'DESC' }
    });

    res.json({
        status: 'success',
        data: {
            documents
        }
    });
});

export const getDocumentDownloadUrl = asyncHandler(async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const documentRepo = AppDataSource.getRepository(Document);
    const document = await documentRepo.findOne({
        where: { id, tenantId: req.user?.tenantId }
    });

    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const url = await storageService.getPresignedUrl(document.storageKey);

    res.json({
        status: 'success',
        data: {
            url
        }
    });
});
