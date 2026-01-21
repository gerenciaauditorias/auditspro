import { Router } from 'express';
import {
    createAudit,
    getAudits,
    getAuditById,
    updateAuditStatus,
    updateChecklistItem
} from '../controllers/auditController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(ensureTenantIsolation);

router.get('/', getAudits);
router.post('/', createAudit);
router.get('/:id', getAuditById);
router.patch('/:id/status', updateAuditStatus);
router.patch('/:auditId/checklist/:checklistId', updateChecklistItem);

export default router;
