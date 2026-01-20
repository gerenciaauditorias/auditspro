import { Router } from 'express';
import multer from 'multer';
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    requestApproval,
    approveDocument
} from '../controllers/documentController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(ensureTenantIsolation);

// Basic CRUD
router.get('/', getDocuments);
router.post('/', createDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);

// Workflow
router.post('/:id/request-approval', requestApproval);
router.post('/:id/approve', approveDocument);

export default router;
