import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, getDocumentDownloadUrl } from '../controllers/documentController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(ensureTenantIsolation);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id/download', getDocumentDownloadUrl);

export default router;
