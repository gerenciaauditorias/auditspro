"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveDocument = exports.requestApproval = exports.updateDocument = exports.getDocumentById = exports.getDocuments = exports.createDocument = void 0;
const database_1 = require("../config/database");
const Document_1 = require("../models/Document");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.createDocument = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { title, type, code, content } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const documentRepo = database_1.AppDataSource.getRepository(Document_1.Document);
    // Check if code exists for this tenant
    if (code) {
        const existing = await documentRepo.findOne({ where: { code, tenantId } });
        if (existing) {
            throw new errorHandler_1.AppError('A document with this code already exists in your organization', 400);
        }
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
        version: 1
    });
    await documentRepo.save(document);
    res.status(201).json({
        status: 'success',
        data: { document }
    });
});
exports.getDocuments = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const tenantId = req.user.tenantId;
    const documentRepo = database_1.AppDataSource.getRepository(Document_1.Document);
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
exports.getDocumentById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const documentRepo = database_1.AppDataSource.getRepository(Document_1.Document);
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new errorHandler_1.AppError('Document not found', 404);
    }
    res.json({
        status: 'success',
        data: { document }
    });
});
exports.updateDocument = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { title, type, code, content, status } = req.body;
    const tenantId = req.user.tenantId;
    const documentRepo = database_1.AppDataSource.getRepository(Document_1.Document);
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new errorHandler_1.AppError('Document not found', 404);
    }
    if (title)
        document.fileName = title;
    if (type)
        document.type = type;
    if (code)
        document.code = code;
    if (content)
        document.content = content;
    if (status)
        document.status = status;
    await documentRepo.save(document);
    res.json({
        status: 'success',
        data: { document }
    });
});
exports.requestApproval = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const documentRepo = database_1.AppDataSource.getRepository(Document_1.Document);
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new errorHandler_1.AppError('Document not found', 404);
    }
    document.status = 'under_review';
    await documentRepo.save(document);
    res.json({
        status: 'success',
        data: { document }
    });
});
exports.approveDocument = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const documentRepo = database_1.AppDataSource.getRepository(Document_1.Document);
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new errorHandler_1.AppError('Document not found', 404);
    }
    document.status = 'approved';
    document.approvedById = userId;
    document.approvalDate = new Date();
    await documentRepo.save(document);
    res.json({
        status: 'success',
        data: { document }
    });
});
