import { Router } from 'express';
import { getTenantInfo, updateTenant } from '../controllers/tenantController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';
import { requireTenantAdmin } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);
router.use(ensureTenantIsolation);

router.get('/', getTenantInfo);
router.patch('/', requireTenantAdmin, updateTenant);

export default router;
