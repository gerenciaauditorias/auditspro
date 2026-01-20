import { Router } from 'express';
import {
    createRisk,
    getRisks
} from '../controllers/riskController';
import { authenticate, ensureTenantIsolation } from '../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(ensureTenantIsolation);

router.get('/', getRisks);
router.post('/', createRisk);

export default router;
