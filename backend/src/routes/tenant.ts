import { Router } from 'express';
import { updateOnboarding, getTenantInfo } from '../controllers/tenantController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All tenant routes require authentication
router.use(authenticate);

router.post('/onboarding', updateOnboarding);
router.get('/info', getTenantInfo);

export default router;
