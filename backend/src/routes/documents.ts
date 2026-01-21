import { Router } from 'express';
import multer from 'multer';
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    requestApproval,
    approveDocument,
    rejectDocument,
    uploadDocument
} from '../controllers/documentController';
import {
    searchDocuments,
    getDocumentVersions,
    grantPermission,
    getDocumentPermissions,
    revokePermission,
    getDocumentMatrix
} from '../controllers/documentAdvancedController';
import {
    addComment,
    getComments,
    updateComment,
    deleteComment
} from '../controllers/documentCommentController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(ensureTenantIsolation);

// Search & Matrix
router.get('/search', searchDocuments);
router.get('/matrix', getDocumentMatrix);

// Basic CRUD
router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadDocument); // Must be before generic /:id Routes
router.post('/', createDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);

// Workflow
router.post('/:id/request-approval', requestApproval);
router.post('/:id/approve', approveDocument);
router.post('/:id/reject', rejectDocument);

// Versions
router.get('/:id/versions', getDocumentVersions);

// Permissions
router.get('/:id/permissions', getDocumentPermissions);
router.post('/:id/permissions', grantPermission);
router.delete('/:id/permissions/:permissionId', revokePermission);

// Comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);
router.put('/:id/comments/:commentId', updateComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;
