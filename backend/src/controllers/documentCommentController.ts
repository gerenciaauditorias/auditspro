import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { DocumentComment } from '../models/DocumentComment';
import { AppError, asyncHandler } from '../middlewares/errorHandler';

// Add comment to document
export const addComment = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const commentRepo = AppDataSource.getRepository(DocumentComment);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    // Validate content
    if (!content || content.trim().length === 0) {
        throw new AppError('Comment content is required', 400);
    }

    // If replying to a comment, verify it exists
    if (parentCommentId) {
        const parentComment = await commentRepo.findOne({
            where: { id: parentCommentId, documentId: id }
        });
        if (!parentComment) {
            throw new AppError('Parent comment not found', 404);
        }
    }

    const comment = commentRepo.create({
        documentId: id,
        userId,
        content: content.trim(),
        parentCommentId: parentCommentId || null
    });

    await commentRepo.save(comment);

    // Fetch with relations for response
    const savedComment = await commentRepo.findOne({
        where: { id: comment.id },
        relations: ['user']
    });

    res.status(201).json({
        status: 'success',
        data: { comment: savedComment }
    });
});

// Get all comments for a document
export const getComments = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const tenantId = (req as any).user.tenantId;

    const documentRepo = AppDataSource.getRepository(Document);
    const commentRepo = AppDataSource.getRepository(DocumentComment);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const comments = await commentRepo.find({
        where: { documentId: id },
        relations: ['user', 'parentComment'],
        order: { createdAt: 'ASC' }
    });

    // Organize into threads
    const commentMap = new Map();
    const threads: any[] = [];

    // First pass: create map
    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    comments.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.id);
        if (comment.parentCommentId) {
            const parent = commentMap.get(comment.parentCommentId);
            if (parent) {
                parent.replies.push(commentWithReplies);
            }
        } else {
            threads.push(commentWithReplies);
        }
    });

    res.json({
        status: 'success',
        results: threads.length,
        data: { comments: threads }
    });
});

// Update comment
export const updateComment = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const commentRepo = AppDataSource.getRepository(DocumentComment);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const comment = await commentRepo.findOne({
        where: { id: commentId, documentId: id }
    });

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    // Only comment author can edit
    if (comment.userId !== userId) {
        throw new AppError('You can only edit your own comments', 403);
    }

    if (!content || content.trim().length === 0) {
        throw new AppError('Comment content is required', 400);
    }

    comment.content = content.trim();
    comment.updatedAt = new Date();
    await commentRepo.save(comment);

    res.json({
        status: 'success',
        data: { comment }
    });
});

// Delete comment
export const deleteComment = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id, commentId } = req.params;
    const tenantId = (req as any).user.tenantId;
    const userId = (req as any).user.userId;

    const documentRepo = AppDataSource.getRepository(Document);
    const commentRepo = AppDataSource.getRepository(DocumentComment);

    // Verify document belongs to tenant
    const document = await documentRepo.findOne({ where: { id, tenantId } });
    if (!document) {
        throw new AppError('Document not found', 404);
    }

    const comment = await commentRepo.findOne({
        where: { id: commentId, documentId: id }
    });

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    // Only comment author can delete
    if (comment.userId !== userId) {
        throw new AppError('You can only delete your own comments', 403);
    }

    await commentRepo.remove(comment);

    res.json({
        status: 'success',
        message: 'Comment deleted successfully'
    });
});
