import { Router } from 'express';
import { getAllTenants, getSystemConfig, updateSystemConfig, deleteTenant } from '../controllers/adminController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

// All routes require Super Admin role
router.use(authenticate);
router.use(requireRole(['super_admin']));

// Tenant Management
router.get('/tenants', getAllTenants);
router.delete('/tenants/:id', deleteTenant);

// System Configuration
router.get('/config', getSystemConfig);
router.patch('/config', updateSystemConfig);

export default router;
