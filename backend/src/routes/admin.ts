import { Router } from 'express';
import {
    getAllTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    getAllUsers,
    getAllAudits,
    getAllDocuments,
    getAllNCs,
    getGlobalStats,
    getSystemConfig,
    updateSystemConfig,
    testSMTP
} from '../controllers/adminController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

const router = Router();

// All routes require Super Admin role
router.use(authenticate);
router.use(requireRole(['super_admin']));

// Dashboard Stats
router.get('/stats', getGlobalStats);

// Tenant Management
router.get('/tenants', getAllTenants);
router.post('/tenants', createTenant);
router.patch('/tenants/:id', updateTenant);
router.delete('/tenants/:id', deleteTenant);

// Global Data Views
router.get('/users', getAllUsers);
router.get('/audits', getAllAudits);
router.get('/documents', getAllDocuments);
router.get('/ncs', getAllNCs);

// System Configuration
router.get('/config', getSystemConfig);
router.patch('/config', updateSystemConfig);
router.post('/config/test-smtp', testSMTP as any);

export default router;
