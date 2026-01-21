import { Router } from 'express';
import multer from 'multer';
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    requestApproval,
    approveDocument,
    rejectDocument
} from '../controllers/documentController';
import {
    searchDocuments,
    getDocumentVersions,
    grantPermission,
    getDocumentPermissions,
    revokePermission,
    getDocumentMatrix
} from '../controllers/documentAdvancedController';
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

export default router;
